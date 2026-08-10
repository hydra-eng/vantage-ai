/**
 * Vantage AI — PDF Export Module
 * Two-Tier Executive Report: Portrait summary + Landscape telemetry appendix
 * Uses jsPDF 2.5 + jspdf-autotable 3.8 (CDN loaded before this module)
 */

/* ── Model pricing in INR per token (approximate, Apr 2026) ── */
const MODEL_PRICING = {
  'gpt-4o':            { prompt: 0.000416, completion: 0.001248, label: 'GPT-4o' },
  'gpt-4-turbo':       { prompt: 0.000832, completion: 0.002496, label: 'GPT-4 Turbo' },
  'gpt-3.5-turbo':     { prompt: 0.0000416,completion: 0.0000624,label: 'GPT-3.5 Turbo' },
  'claude-3-5-sonnet': { prompt: 0.000249, completion: 0.001247, label: 'Claude 3.5 Sonnet' },
  'claude-3-haiku':    { prompt: 0.0000208,completion: 0.000104, label: 'Claude 3 Haiku' },
  'gemini-1.5-pro':    { prompt: 0.000104, completion: 0.000312, label: 'Gemini 1.5 Pro' },
  'gemini-1.5-flash':  { prompt: 0.0000104,completion: 0.0000312,label: 'Gemini 1.5 Flash' },
  'llama-3.1-70b':     { prompt: 0.0000499,completion: 0.0000499,label: 'Llama 3.1 70B' },
};

/* ── Provider aggregate data (mirrors dashboard state) ── */
const PROVIDER_DATA = [
  { name: 'OpenAI',           tokens: 9_820_000, cost: 112430, budgetPct: 89 },
  { name: 'Anthropic Claude', tokens: 3_410_000, cost:  54180, budgetPct: 72 },
  { name: 'Google Gemini',    tokens: 2_980_000, cost:  38290, budgetPct: 61 },
  { name: 'Synthesia',        tokens: 1_120_000, cost:  35280, budgetPct: 94 },
  { name: 'GitHub Copilot',   tokens: 2_650_000, cost:  26600, budgetPct: 106 },
  { name: 'Runway ML',        tokens:   880_000, cost:  26160, budgetPct: 82 },
  { name: 'Meta Llama',       tokens: 1_440_000, cost:  16370, budgetPct: 55 },
  { name: 'ElevenLabs',       tokens:   510_000, cost:  11440, budgetPct: 48 },
];

/* ── Telemetry rows for appendix ── */
const TELEMETRY_ROWS = [
  { ts:'2026-07-31 23:58', eid:'EMP-EN-001', team:'Engineering',  provider:'OpenAI',    model:'gpt-4o',           prompt:12400, completion:3820, cost:7298, policy:'Normal',  loop:false },
  { ts:'2026-07-31 22:41', eid:'EMP-EN-002', team:'Engineering',  provider:'OpenAI',    model:'gpt-4-turbo',      prompt:8200,  completion:1100, cost:9527, policy:'Warning', loop:false },
  { ts:'2026-07-31 21:30', eid:'EMP-EN-011', team:'Engineering',  provider:'OpenAI',    model:'gpt-4o',           prompt:3800,  completion:31200,cost:41590,policy:'Hard Cap',loop:true  },
  { ts:'2026-07-31 20:15', eid:'EMP-VD-003', team:'Video',        provider:'Runway ML', model:'runway-gen3',      prompt:2100,  completion:890,  cost:4830, policy:'Warning', loop:false },
  { ts:'2026-07-31 19:54', eid:'EMP-MK-007', team:'Marketing',    provider:'OpenAI',    model:'gpt-4o',           prompt:5400,  completion:1620, cost:3244, policy:'Normal',  loop:false },
  { ts:'2026-07-31 18:30', eid:'EMP-PD-004', team:'Product',      provider:'Synthesia', model:'synthesia-v2',     prompt:900,   completion:3600, cost:8190, policy:'Warning', loop:false },
  { ts:'2026-07-31 17:12', eid:'EMP-EN-005', team:'Engineering',  provider:'Anthropic', model:'claude-3-5-sonnet',prompt:11200, completion:2840, cost:6324, policy:'Normal',  loop:false },
  { ts:'2026-07-31 16:45', eid:'EMP-DA-002', team:'Data & Analy.',provider:'Google',    model:'gemini-1.5-pro',   prompt:18600, completion:4200, cost:3243, policy:'Normal',  loop:false },
  { ts:'2026-07-31 15:30', eid:'EMP-OP-001', team:'Operations',   provider:'OpenAI',    model:'gpt-3.5-turbo',    prompt:22000, completion:5800, cost:1279, policy:'Normal',  loop:false },
  { ts:'2026-07-31 14:10', eid:'EMP-EN-008', team:'Engineering',  provider:'GitHub',    model:'copilot-chat',     prompt:9800,  completion:2200, cost:2185, policy:'Hard Cap',loop:false },
  { ts:'2026-07-31 13:55', eid:'EMP-MK-003', team:'Marketing',    provider:'ElevenLabs',model:'eleven-turbo-v2',  prompt:1200,  completion:4800, cost:2810, policy:'Normal',  loop:false },
  { ts:'2026-07-30 22:30', eid:'EMP-VD-001', team:'Video',        provider:'Runway ML', model:'runway-gen3',      prompt:1800,  completion:720,  cost:4153, policy:'Warning', loop:false },
  { ts:'2026-07-30 20:15', eid:'EMP-EN-003', team:'Engineering',  provider:'OpenAI',    model:'gpt-4o',           prompt:6200,  completion:1880, cost:4889, policy:'Normal',  loop:false },
  { ts:'2026-07-30 18:40', eid:'EMP-PD-002', team:'Product',      provider:'Anthropic', model:'claude-3-haiku',   prompt:14400, completion:3600, cost:677,  policy:'Normal',  loop:false },
  { ts:'2026-07-30 16:20', eid:'EMP-DA-005', team:'Data & Analy.',provider:'Google',    model:'gemini-1.5-flash', prompt:42000, completion:8400, cost:877,  policy:'Normal',  loop:false },
];

/* ── Helpers ── */
function inrFormat(n) {
  return '₹' + n.toLocaleString('en-IN');
}
function policyColor(pct) {
  if (pct >= 100) return [218, 30, 40];
  if (pct >= 80)  return [161, 100, 0];
  return [36, 161, 72];
}
function policyLabel(pct) {
  if (pct >= 100) return 'Hard Cap';
  if (pct >= 80)  return 'Warning';
  return 'Normal';
}

/* ── Progress bar helpers ── */
function showProgress() {
  const bar = document.getElementById('pdf-progress-bar');
  if (bar) { bar.style.opacity = '1'; bar.style.width = '0%'; bar.style.transition = 'none'; }
  requestAnimationFrame(() => {
    if (bar) { bar.style.transition = 'width 2.5s cubic-bezier(0.1,0.6,0.5,1)'; bar.style.width = '85%'; }
  });
}
function finishProgress() {
  const bar = document.getElementById('pdf-progress-bar');
  if (bar) {
    bar.style.width = '100%';
    bar.style.transition = 'width 0.3s ease';
    setTimeout(() => { bar.style.opacity = '0'; bar.style.width = '0%'; }, 600);
  }
}
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-msg">${msg}</span>`;
  document.querySelector('.toast-container')?.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

/* ── Page 1: Executive Summary (Portrait A4) ── */
function buildPage1(doc, options) {
  const { jsPDF } = window.jspdf;
  const W = 210, margin = 20;

  // ─ Header block ─
  doc.setFillColor(15, 98, 254);
  doc.rect(0, 0, W, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('VANTAGE AI', margin, 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Enterprise AI Spend & Governance Report', margin, 16);
  doc.setTextColor(200, 220, 255);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W - margin, 11.5, { align: 'right' });
  doc.text(`Billing Period: ${options.period}  ·  Workspace: ${options.workspace}`, W - margin, 16, { align: 'right' });

  // ─ Section: Executive AI Spend Summary ─
  let y = 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(22, 22, 22);
  doc.text('Executive AI Spend Summary', margin, y);
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y + 2, W - margin, y + 2);
  y += 10;

  // ─ KPI boxes ─
  const kpis = [
    { label: 'Total AI API Spend', value: '₹3,39,553', sub: 'July 2026', color: [15, 98, 254] },
    { label: 'Allocated Budget',   value: '₹4,20,000', sub: 'Monthly cap', color: [36, 161, 72] },
    { label: 'Budget Health',      value: '80.8%',     sub: 'Consumed', color: [161, 100, 0] },
    { label: 'Tokens Consumed',    value: '22.8M',     sub: 'All providers', color: [107, 70, 193] },
  ];
  const boxW = (W - margin * 2 - 9) / 4;
  kpis.forEach((k, i) => {
    const x = margin + i * (boxW + 3);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(x, y, boxW, 24, 2, 2, 'F');
    doc.setDrawColor(...k.color);
    doc.setLineWidth(0.8);
    doc.line(x, y, x, y + 24);
    doc.setLineWidth(0.2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(k.label, x + 4, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...k.color);
    doc.text(k.value, x + 4, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    doc.text(k.sub, x + 4, y + 22);
  });
  y += 32;

  // ─ Provider Breakdown Table ─
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 22, 22);
  doc.text('AI Provider Breakdown', margin, y);
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y + 2, W - margin, y + 2);
  y += 6;

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Provider', 'Tokens Consumed', 'Jul Spend', 'Budget %', 'Policy Status']],
    body: PROVIDER_DATA.map(p => {
      const [r, g, b] = policyColor(p.budgetPct);
      return [
        p.name,
        (p.tokens / 1e6).toFixed(2) + 'M',
        inrFormat(p.cost),
        p.budgetPct + '%',
        policyLabel(p.budgetPct),
      ];
    }),
    headStyles: { fillColor: [15, 98, 254], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8.5, textColor: [22, 22, 22] },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 38, halign: 'right' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 30 },
    },
    didDrawCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const pct = PROVIDER_DATA[data.row.index]?.budgetPct ?? 0;
        const [r, g, b] = policyColor(pct);
        doc.setTextColor(r, g, b);
        doc.setFontSize(8);
        doc.text(policyLabel(pct), data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1.5, { baseline: 'middle' });
        data.cell.text = [];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ─ Policy Legend ─
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 22, 22);
  doc.text('Policy Threshold Legend', margin, y);
  y += 5;
  const legends = [
    { label: '< 80%  Normal operation', color: [36, 161, 72] },
    { label: '≥ 80%  Warning / Throttling active', color: [161, 100, 0] },
    { label: '≥ 100% Hard Cap — API key blocked', color: [218, 30, 40] },
  ];
  legends.forEach(l => {
    doc.setFillColor(...l.color);
    doc.rect(margin, y, 3, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...l.color);
    doc.text(l.label, margin + 5, y + 2.5);
    y += 6;
  });

  // ─ Sign-off block ─
  y = Math.max(y, 230);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, W - margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 22, 22);
  doc.text('Executive Sign-Off — Compliance Approval', margin, y + 6);
  y += 14;

  const sigLines = [
    { role: 'Finance Director / CFO', name: options.sigName || '_________________________' },
    { role: 'CISO / Security Lead',   name: '_________________________' },
    { role: 'CTO / Engineering Head', name: '_________________________' },
  ];
  const sigW = (W - margin * 2 - 12) / 3;
  sigLines.forEach((s, i) => {
    const x = margin + i * (sigW + 6);
    doc.setDrawColor(100, 100, 100);
    doc.line(x, y + 10, x + sigW, y + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 22, 22);
    doc.text(s.role, x, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('Signature & Date', x, y + 21);
  });

  // ─ Footer ─
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text('Vantage AI · Confidential · Generated for internal compliance use only', W / 2, 290, { align: 'center' });
  doc.text('Page 1 of 2', W - margin, 290, { align: 'right' });
}

/* ── Page 2+: Telemetry Appendix (Landscape A4) ── */
function buildPage2(doc, options) {
  const W = 297, margin = 15;

  // ─ Appendix header ─
  doc.setFillColor(22, 22, 22);
  doc.rect(0, 0, W, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('VANTAGE AI — Itemised Telemetry Appendix', margin, 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(`Period: ${options.period}  ·  Workspace: ${options.workspace}  ·  CONFIDENTIAL`, W - margin, 9, { align: 'right' });

  let y = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 22, 22);
  doc.text('Raw Telemetry Ledger', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`${TELEMETRY_ROWS.length} transactions · Loop Detection: rows where completion/prompt ratio > 8× flagged`, margin, y + 5);
  y += 10;

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Timestamp', 'Employee ID', 'Team', 'Provider', 'Model', 'Prompt Tok', 'Completion Tok', 'Total Cost ₹', 'Policy', 'Loop?']],
    body: TELEMETRY_ROWS.map(r => [
      r.ts, r.eid, r.team, r.provider, r.model,
      r.prompt.toLocaleString('en-IN'),
      r.completion.toLocaleString('en-IN'),
      inrFormat(r.cost),
      policyLabel(r.policy === 'Hard Cap' ? 100 : r.policy === 'Warning' ? 80 : 0),
      r.loop ? 'LOOP ⚠' : '—',
    ]),
    headStyles: { fillColor: [22, 22, 22], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [22, 22, 22] },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 24 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: 34 },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 26, halign: 'right' },
      7: { cellWidth: 24, halign: 'right' },
      8: { cellWidth: 20 },
      9: { cellWidth: 18, halign: 'center' },
    },
    didDrawCell(data) {
      if (data.section !== 'body') return;
      const row = TELEMETRY_ROWS[data.row.index];
      if (!row) return;
      // Policy color
      if (data.column.index === 8) {
        const [r, g, b] = policyColor(row.policy === 'Hard Cap' ? 100 : row.policy === 'Warning' ? 80 : 0);
        doc.setTextColor(r, g, b);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(policyLabel(row.policy === 'Hard Cap' ? 100 : row.policy === 'Warning' ? 80 : 0),
          data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1, { baseline: 'middle' });
        data.cell.text = [];
      }
      // Loop detection color
      if (data.column.index === 9 && row.loop) {
        doc.setTextColor(218, 30, 40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('LOOP ⚠', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center', baseline: 'middle' });
        data.cell.text = [];
      }
    },
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    didDrawPage(data) {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text('Vantage AI · Confidential', margin, 208);
      doc.text(`Page ${pg} of ${doc.internal.pages.length - 1}`, W - margin, 208, { align: 'right' });
    },
  });
}

/* ── Main export function ── */
export async function exportVantagePDF(options = {}) {
  const opts = {
    period: options.period || 'July 2026',
    workspace: options.workspace || 'TechCorp India Pvt. Ltd.',
    sigName: options.sigName || '',
    includeAppendix: options.includeAppendix !== false,
  };

  // Safety: confirm jsPDF is available
  if (!window.jspdf?.jsPDF) {
    showToast('PDF library not loaded. Please refresh and try again.', 'error');
    return;
  }

  // Disable buttons
  const btns = document.querySelectorAll('[data-pdf-trigger]');
  btns.forEach(b => { b.disabled = true; b.setAttribute('aria-busy', 'true'); });
  showProgress();

  // WebGL safety: hide Spline iframe
  const splineIframe = document.getElementById('spline-bg-iframe');
  const splineContainer = document.getElementById('spline-bg-container');
  if (splineIframe) splineIframe.style.visibility = 'hidden';
  if (splineContainer) splineContainer.style.visibility = 'hidden';

  await new Promise(r => setTimeout(r, 80)); // allow repaint

  try {
    const { jsPDF } = window.jspdf;

    // Page 1 — Portrait
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    buildPage1(doc, opts);

    // Page 2 — Landscape appendix
    if (opts.includeAppendix) {
      doc.addPage([297, 210], 'landscape');
      buildPage2(doc, opts);
    }

    const filename = `Vantage_Report_${opts.period.replace(/\s/g, '_')}.pdf`;
    doc.save(filename);
    finishProgress();
    showToast(`Report saved — ${filename}`);
  } catch (err) {
    console.error('PDF generation failed:', err);
    finishProgress();
    showToast('Failed to generate report. Try again.', 'error');
  } finally {
    // Restore WebGL
    if (splineIframe) splineIframe.style.visibility = '';
    if (splineContainer) splineContainer.style.visibility = '';
    btns.forEach(b => { b.disabled = false; b.removeAttribute('aria-busy'); });
  }
}

/* ── Keyboard shortcut: Ctrl+Shift+P ── */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    document.getElementById('btn-generate-report')?.click();
  }
  // ? key → shortcuts panel
  if (e.key === '?' && !e.ctrlKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
    document.getElementById('shortcuts-panel')?.classList.toggle('hidden');
  }
  // Esc → close panels
  if (e.key === 'Escape') {
    document.getElementById('shortcuts-panel')?.classList.add('hidden');
    document.getElementById('pdf-options-modal')?.classList.add('hidden');
    document.getElementById('report-dropdown')?.classList.add('hidden');
  }
  // G + O/E/B/P/S nav shortcuts
  if (e.key === 'g' && !e.ctrlKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
    window._waitingForNavKey = true;
    setTimeout(() => { window._waitingForNavKey = false; }, 1500);
  }
  if (window._waitingForNavKey) {
    const map = { o:'overview', e:'employees', b:'budgets', p:'providers', s:'settings', t:'telemetry' };
    if (map[e.key]) {
      window._waitingForNavKey = false;
      document.querySelector(`[data-view="${map[e.key]}"]`)?.click();
    }
  }
});
