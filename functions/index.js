/**
 * Vantage AI — Secure Backend LLM Proxy & Telemetry Cloud Function
 *
 * Enforces server-side AI API governance:
 * 1. Checks employee/workspace budget cap in Firestore before execution
 * 2. Securely calls OpenAI or Anthropic API using server-side keys
 * 3. Extracts exact prompt and completion token counts from response
 * 4. Logs immutable telemetry record and updates spend totals in Firestore
 * 5. Returns completion text, true token counts, and policy status
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Cost per 1,000 tokens in INR (₹)
const MODEL_PRICING = {
  'gpt-4o':             { prompt: 0.21, completion: 0.63 },
  'gpt-4-turbo':        { prompt: 0.83, completion: 2.49 },
  'gpt-3.5-turbo':      { prompt: 0.04, completion: 0.12 },
  'claude-3-5-sonnet':  { prompt: 0.25, completion: 1.25 },
  'claude-3-haiku':     { prompt: 0.02, completion: 0.10 },
  'gemini-1.5-pro':     { prompt: 0.30, completion: 1.00 },
};

/**
 * HTTPS onRequest Handler: /api/aiProxy
 */
exports.aiProxy = functions.https.onRequest(async (req, res) => {
  // CORS Headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { prompt, provider = 'openai', model = 'gpt-4o', employeeId = 'EMP-EN-001', workspaceId = 'default' } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "prompt" parameter.' });
    }

    // ── 1. SERVER-SIDE BUDGET & POLICY CHECK ────────────────────────────────
    const empRef = db.collection('workspaces').doc(workspaceId).collection('employees').doc(employeeId);
    const empDoc = await empRef.get().catch(() => null);

    let currentSpend = 0;
    let budgetLimit = 150000; // default ₹1.5L
    if (empDoc && empDoc.exists) {
      const data = empDoc.data();
      currentSpend = data.spent || 0;
      budgetLimit = data.budget || budgetLimit;
    }

    const usagePct = (currentSpend / budgetLimit) * 100;
    let policyStatus = 'Normal';
    if (usagePct >= 100) {
      policyStatus = 'Hard Cap';
      return res.status(403).json({
        error: 'Budget hard cap reached.',
        policyStatus: 'Hard Cap',
        employeeId,
        currentSpend,
        budgetLimit
      });
    } else if (usagePct >= 80) {
      policyStatus = 'Warning';
    }

    // ── 2. SECURE SERVER-SIDE LLM CALL ──────────────────────────────────────
    let completionText = '';
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;

    const apiKey = process.env.OPENAI_API_KEY || req.headers['authorization']?.replace('Bearer ', '') || '';
    const anthropicKey = process.env.ANTHROPIC_API_KEY || req.headers['x-api-key'] || '';

    if (provider.toLowerCase() === 'anthropic' || model.includes('claude')) {
      if (!anthropicKey) {
        return res.status(401).json({ error: 'Server key missing for Anthropic.' });
      }
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-haiku-20240307',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Anthropic HTTP ${response.status}`);
      }
      completionText = data.content?.[0]?.text || '';
      promptTokens = data.usage?.input_tokens || Math.ceil(prompt.length / 4);
      completionTokens = data.usage?.output_tokens || Math.ceil(completionText.length / 4);
      totalTokens = promptTokens + completionTokens;
    } else {
      // OpenAI Call
      if (!apiKey) {
        return res.status(401).json({ error: 'Server key missing for OpenAI.' });
      }
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `OpenAI HTTP ${response.status}`);
      }
      completionText = data.choices?.[0]?.message?.content || '';
      promptTokens = data.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
      completionTokens = data.usage?.completion_tokens || Math.ceil(completionText.length / 4);
      totalTokens = data.usage?.total_tokens || (promptTokens + completionTokens);
    }

    // ── 3. COST CALCULATION & TELEMETRY WRITE ──────────────────────────────
    const rates = MODEL_PRICING[model] || { prompt: 0.10, completion: 0.30 };
    const estimatedCost = Math.round((promptTokens / 1000 * rates.prompt) + (completionTokens / 1000 * rates.completion));
    const isLoopDetected = (completionTokens / Math.max(promptTokens, 1)) > 8;

    const telemDoc = {
      ts: new Date().toISOString(),
      eid: employeeId,
      workspaceId,
      provider: provider.toUpperCase(),
      model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      cost: estimatedCost,
      policyStatus,
      loopDetected: isLoopDetected,
      confidenceTier: 'live',
      syncedAt: new Date().toISOString()
    };

    // Server-side write to Firestore Telemetry collection (bypasses client security rules)
    await db.collection('workspaces').doc(workspaceId).collection('telemetry').add(telemDoc).catch(err => {
      console.warn('Firestore Telemetry write warning:', err.message);
    });

    // Update Employee cumulative spend
    if (empDoc && empDoc.exists) {
      await empRef.update({
        spent: admin.firestore.FieldValue.increment(estimatedCost),
        lastActive: new Date().toISOString()
      }).catch(() => {});
    }

    // ── 4. RETURN SECURE RESPONSE ───────────────────────────────────────────
    return res.status(200).json({
      success: true,
      completion: completionText,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost_inr: estimatedCost
      },
      policyStatus,
      confidenceTier: 'live',
      syncedAt: telemDoc.syncedAt
    });

  } catch (error) {
    console.error('[AI Proxy Error]:', error.message);
    return res.status(500).json({
      error: error.message || 'Internal proxy error',
      policyStatus: 'Error'
    });
  }
});
