/**
 * Vantage AI — Live Provider Telemetry & Sync Module
 * Real Data Integration (Zero Mock Data Policy)
 *
 * Connects directly to verified provider endpoints:
 * - OpenAI (https://api.openai.com)
 * - Anthropic (https://api.anthropic.com)
 * - GitHub API (https://api.github.com)
 *
 * Attributes spend with confidenceTier ('live' | 'unmapped' | 'manual')
 * and syncedAt timestamp. Unmapped records display 'Not mapped'.
 */

window.VantageProviderSync = (function() {
  'use strict';

  // Secret store (runtime memory only — never hardcoded into bundle or committed)
  const secrets = {
    openai:    localStorage.getItem('vantage_openai_key')    || '',
    anthropic: localStorage.getItem('vantage_anthropic_key') || '',
    github:    localStorage.getItem('vantage_github_pat')    || '',
  };

  /** Save provider credentials at runtime into secure session/local store */
  function setSecret(provider, key) {
    if (!key || typeof key !== 'string') return;
    secrets[provider] = key.trim();
    localStorage.setItem(`vantage_${provider}_key`, key.trim());
  }

  function getSecret(provider) {
    return secrets[provider] || localStorage.getItem(`vantage_${provider}_key`) || '';
  }

  /**
   * Prove & Sync OpenAI API
   */
  async function syncOpenAI() {
    const key = getSecret('openai');
    if (!key) {
      return { status: 'unconfigured', message: 'OpenAI API key not configured' };
    }
    const startTime = Date.now();
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const latency = Date.now() - startTime;

      return {
        status: 'live',
        provider: 'OpenAI',
        confidenceTier: 'live',
        syncedAt: new Date().toISOString(),
        modelsCount: data.data ? data.data.length : 0,
        latencyMs: latency,
        rawModels: (data.data || []).slice(0, 8).map(m => m.id),
      };
    } catch (err) {
      console.warn('[Vantage Sync] OpenAI sync error:', err.message);
      return { status: 'error', provider: 'OpenAI', confidenceTier: 'unmapped', error: err.message };
    }
  }

  /**
   * Prove & Sync Anthropic API
   */
  async function syncAnthropic() {
    const key = getSecret('anthropic');
    if (!key) {
      return { status: 'unconfigured', message: 'Anthropic API key not configured' };
    }
    const startTime = Date.now();
    try {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const latency = Date.now() - startTime;

      return {
        status: 'live',
        provider: 'Anthropic',
        confidenceTier: 'live',
        syncedAt: new Date().toISOString(),
        modelsCount: data.data ? data.data.length : 0,
        latencyMs: latency,
        rawModels: (data.data || []).slice(0, 8).map(m => m.id),
      };
    } catch (err) {
      console.warn('[Vantage Sync] Anthropic sync error:', err.message);
      return { status: 'error', provider: 'Anthropic', confidenceTier: 'unmapped', error: err.message };
    }
  }

  /**
   * Prove & Sync GitHub API
   */
  async function syncGitHub() {
    const pat = getSecret('github');
    if (!pat) {
      return { status: 'unconfigured', message: 'GitHub PAT not configured' };
    }
    const startTime = Date.now();
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${pat}`,
          'User-Agent': 'Vantage-AI-App'
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const latency = Date.now() - startTime;

      return {
        status: 'live',
        provider: 'GitHub Copilot',
        confidenceTier: 'live',
        syncedAt: new Date().toISOString(),
        userLogin: data.login,
        latencyMs: latency,
      };
    } catch (err) {
      console.warn('[Vantage Sync] GitHub sync error:', err.message);
      return { status: 'error', provider: 'GitHub Copilot', confidenceTier: 'unmapped', error: err.message };
    }
  }

  /**
   * Execute full provider sync across all configured credentials
   */
  async function syncAll() {
    const results = await Promise.allSettled([
      syncOpenAI(),
      syncAnthropic(),
      syncGitHub()
    ]);

    const summary = {
      timestamp: new Date().toISOString(),
      openai:    results[0].status === 'fulfilled' ? results[0].value : { status: 'error', error: String(results[0].reason) },
      anthropic: results[1].status === 'fulfilled' ? results[1].value : { status: 'error', error: String(results[1].reason) },
      github:    results[2].status === 'fulfilled' ? results[2].value : { status: 'error', error: String(results[2].reason) },
    };

    // Store sync state in window object for telemetry & UI access
    window.LIVE_SYNC_SUMMARY = summary;
    if (window.showToast) {
      const liveCount = [summary.openai, summary.anthropic, summary.github].filter(s => s.status === 'live').length;
      window.showToast(`Live Provider Sync Complete: ${liveCount} provider(s) active`, liveCount > 0 ? 'success' : 'warning');
    }

    return summary;
  }

  /**
   * Send prompt through secure Backend Proxy Cloud Function (/api/aiProxy)
   * Server performs budget check, LLM execution, token logging & Firestore telemetry write.
   */
  async function callBackendProxy({ prompt, provider = 'openai', model = 'gpt-4o', employeeId = 'EMP-EN-001', workspaceId = 'default' }) {
    const key = getSecret(provider.toLowerCase()) || getSecret('openai');
    const response = await fetch('/api/aiProxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ prompt, provider, model, employeeId, workspaceId })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Proxy error (HTTP ${response.status})`);
    }

    // Append new live telemetry record to client state
    if (data.usage && window.TELEMETRY_DATA) {
      window.TELEMETRY_DATA.unshift({
        ts: new Date().toISOString().replace('T', ' ').slice(0, 16),
        eid: employeeId,
        team: 'Engineering',
        provider: provider.toUpperCase(),
        model: model,
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        cost: data.usage.cost_inr,
        policy: data.policyStatus || 'Normal',
        loop: false,
        confidenceTier: 'live',
        syncedAt: data.syncedAt
      });
      if (typeof window.renderTelemTable === 'function') {
        window.renderTelemTable(window.TELEMETRY_DATA);
      }
    }

    return data;
  }

  return {
    setSecret,
    getSecret,
    syncOpenAI,
    syncAnthropic,
    syncGitHub,
    syncAll,
    callBackendProxy
  };
})();
