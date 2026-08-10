/**
 * Vantage AI — Professional PDF Report Generator
 * Two-Tier Executive Packet: Portrait Summary + Landscape Telemetry Appendix
 * Uses jsPDF 2.5 + jspdf-autotable 3.8 (loaded via CDN before this module)
 *
 * Designed for: Finance Director / CISO / CTO sign-off,
 * billing department submission, and tax documentation.
 */

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const COMPANY   = 'TechCorp India Pvt. Ltd.';
const GSTIN     = '27AABCT1234N1Z5';
const PAN       = 'AABCT1234N';
const ADDR_LINE1 = 'Unit 4B, Prestige Tech Park, Outer Ring Road';
const ADDR_LINE2 = 'Bengaluru, Karnataka – 560 103, India';

// Model pricing — INR per token (excl. GST 18%)
const MODEL_PRICING = {
  'gpt-4o':             { prompt: 0.000416, completion: 0.001248 },
  'gpt-4-turbo':        { prompt: 0.000832, completion: 0.002496 },
  'gpt-3.5-turbo':      { prompt: 0.0000416,completion: 0.0000624 },
  'claude-3-5-sonnet':  { prompt: 0.000249, completion: 0.001247 },
  'claude-3-haiku':     { prompt: 0.0000208,completion: 0.000104  },
  'gemini-1.5-pro':     { prompt: 0.000104, completion: 0.000312  },
  'gemini-1.5-flash':   { prompt: 0.0000104,completion: 0.0000312 },
  'runway-gen3':        { prompt: 0.000050, completion: 0.000200  },
  'synthesia-v2':       { prompt: 0.000150, completion: 0.000450  },
  'copilot-chat':       { prompt: 0.000104, completion: 0.000208  },
  'eleven-turbo-v2':    { prompt: 0.000080, completion: 0.000240  },
  'llama-3.1-70b':      { prompt: 0.0000499,completion: 0.0000499 },
};

// Provider summary
const PROVIDER_DATA = [
  { name:'OpenAI',            category:'Text & Code',     tokens:9820000, cost:112430, budget:200000, budgetPct:89  },
  { name:'Anthropic Claude',  category:'Text & Code',     tokens:3410000, cost:54180,  budget:80000,  budgetPct:72  },
  { name:'Google Gemini',     category:'Text & Code',     tokens:2980000, cost:38290,  budget:63000,  budgetPct:61  },
  { name:'Synthesia',         category:'Video & Image',   tokens:1120000, cost:35280,  budget:37500,  budgetPct:94  },
  { name:'GitHub Copilot',    category:'Code Assist',     tokens:2650000, cost:26600,  budget:25000,  budgetPct:106 },
  { name:'Runway ML',         category:'Video & Image',   tokens:880000,  cost:26160,  budget:32000,  budgetPct:82  },
  { name:'Meta Llama',        category:'Text & Code',     tokens:1440000, cost:16370,  budget:30000,  budgetPct:55  },
  { name:'ElevenLabs',        category:'Audio & Speech',  tokens:510000,  cost:11440,  budget:24000,  budgetPct:48  },
];

// Telemetry ledger
const TELEMETRY = [
  { ts:'2026-07-31 23:58', eid:'EMP-EN-001', workspace:'Engineering',  provider:'OpenAI',     model:'gpt-4o',            prompt:12400, completion:3820,  cost:7298,  budgetPct:89,  loop:false },
  { ts:'2026-07-31 22:41', eid:'EMP-EN-002', workspace:'Engineering',  provider:'OpenAI',     model:'gpt-4-turbo',       prompt:8200,  completion:1100,  cost:9527,  budgetPct:89,  loop:false },
  { ts:'2026-07-31 21:30', eid:'EMP-EN-011', workspace:'Engineering',  provider:'OpenAI',     model:'gpt-4o',            prompt:3800,  completion:31200, cost:41590, budgetPct:106, loop:true  },
  { ts:'2026-07-31 20:15', eid:'EMP-VD-003', workspace:'Video',        provider:'Runway ML',  model:'runway-gen3',       prompt:2100,  completion:890,   cost:4830,  budgetPct:82,  loop:false },
  { ts:'2026-07-31 19:54', eid:'EMP-MK-007', workspace:'Marketing',    provider:'OpenAI',     model:'gpt-4o',            prompt:5400,  completion:1620,  cost:3244,  budgetPct:55,  loop:false },
  { ts:'2026-07-31 18:30', eid:'EMP-PD-004', workspace:'Product',      provider:'Synthesia',  model:'synthesia-v2',      prompt:900,   completion:3600,  cost:8190,  budgetPct:94,  loop:false },
  { ts:'2026-07-31 17:12', eid:'EMP-EN-005', workspace:'Engineering',  provider:'Anthropic',  model:'claude-3-5-sonnet', prompt:11200, completion:2840,  cost:6324,  budgetPct:72,  loop:false },
  { ts:'2026-07-31 16:45', eid:'EMP-DA-002', workspace:'Data & Analy.',provider:'Google',     model:'gemini-1.5-pro',    prompt:18600, completion:4200,  cost:3243,  budgetPct:61,  loop:false },
  { ts:'2026-07-31 15:30', eid:'EMP-OP-001', workspace:'Operations',   provider:'OpenAI',     model:'gpt-3.5-turbo',     prompt:22000, completion:5800,  cost:1279,  budgetPct:48,  loop:false },
  { ts:'2026-07-31 14:10', eid:'EMP-EN-008', workspace:'Engineering',  provider:'GitHub',     model:'copilot-chat',      prompt:9800,  completion:2200,  cost:2185,  budgetPct:106, loop:false },
  { ts:'2026-07-31 13:55', eid:'EMP-MK-003', workspace:'Marketing',    provider:'ElevenLabs', model:'eleven-turbo-v2',   prompt:1200,  completion:4800,  cost:2810,  budgetPct:55,  loop:false },
  { ts:'2026-07-30 22:30', eid:'EMP-VD-001', workspace:'Video',        provider:'Runway ML',  model:'runway-gen3',       prompt:1800,  completion:720,   cost:4153,  budgetPct:82,  loop:false },
  { ts:'2026-07-30 20:15', eid:'EMP-EN-003', workspace:'Engineering',  provider:'OpenAI',     model:'gpt-4o',            prompt:6200,  completion:1880,  cost:4889,  budgetPct:89,  loop:false },
  { ts:'2026-07-30 18:40', eid:'EMP-PD-002', workspace:'Product',      provider:'Anthropic',  model:'claude-3-haiku',    prompt:14400, completion:3600,  cost:677,   budgetPct:72,  loop:false },
  { ts:'2026-07-30 16:20', eid:'EMP-DA-005', workspace:'Data & Analy.',provider:'Google',     model:'gemini-1.5-flash',  prompt:42000, completion:8400,  cost:877,   budgetPct:61,  loop:false },
];

/* ─────────────────────────────────────────────────────────────
   FORMATTERS
───────────────────────────────────────────────────────────── */
function inrFull(n) {
  return '₹' + n.toLocaleString('en-IN');
}
function inrLakh(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
  return inrFull(n);
}
function pctLabel(pct) {
  if (pct >= 100) return 'HARD CAP';
  if (pct >= 80)  return 'WARNING';
  return 'NORMAL';
}
function pctRgb(pct) {
  if (pct >= 100) return [200, 20, 30];
  if (pct >= 80)  return [175, 95, 0];
  return [20, 140, 60];
}
function tokensLabel(t) {
  if (t >= 1000000) return (t / 1000000).toFixed(2) + 'M';
  if (t >= 1000)    return (t / 1000).toFixed(1) + 'K';
  return String(t);
}

/* ─────────────────────────────────────────────────────────────
   PROGRESS / TOAST HELPERS (no-op if not in DOM)
───────────────────────────────────────────────────────────── */
function showProgress() {
  const bar = document.getElementById('pdf-progress-bar');
  if (!bar) return;
  bar.style.opacity = '1';
  bar.style.transition = 'none';
  bar.style.width = '0%';
  requestAnimationFrame(() => {
    bar.style.transition = 'width 3s cubic-bezier(0.1,0.6,0.4,1)';
    bar.style.width = '80%';
  });
}
function finishProgress() {
  const bar = document.getElementById('pdf-progress-bar');
  if (!bar) return;
  bar.style.transition = 'width 0.25s ease';
  bar.style.width = '100%';
  setTimeout(() => { bar.style.opacity = '0'; bar.style.width = '0%'; }, 500);
}

/* ─────────────────────────────────────────────────────────────
   PAGE 1 — EXECUTIVE SUMMARY (Portrait A4)
   Safe area: 210 × 297 mm  |  margins: L/R=14, top handled by header
───────────────────────────────────────────────────────────── */
function buildPage1(doc, opts) {
  const W = 210, ML = 14, MR = 14, body = W - ML - MR;

  /* ── TOP HEADER BAND ─────────────────────────────── */
  // Dark band
  doc.setFillColor(18, 18, 20);
  doc.rect(0, 0, W, 22, 'F');

  // Company logo placeholder — V mark
  doc.setFillColor(15, 98, 254);
  doc.triangle(ML, 4, ML + 8, 18, ML + 16, 4, 'F');
  doc.setFillColor(255, 255, 255);
  doc.triangle(ML + 3.5, 4, ML + 8, 12, ML + 12.5, 4, 'F');

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('VANTAGE AI', ML + 20, 11);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 180);
  doc.text('Enterprise AI Spend Control & Governance Platform', ML + 20, 17.5);

  // Right — report meta
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 180);
  const metaX = W - MR;
  doc.text(`Billing Period: ${opts.period}`, metaX, 9, { align: 'right' });
  doc.text(`Workspace: ${opts.workspace}`, metaX, 14, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleString('en-IN', { dateStyle:'long', timeStyle:'short' })}`, metaX, 19, { align: 'right' });

  /* ── SUBTITLE ROW ─────────────────────────────────── */
  doc.setFillColor(15, 98, 254);
  doc.rect(0, 22, W, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('EXECUTIVE AI SPEND & GOVERNANCE SUMMARY — CONFIDENTIAL', W / 2, 26.2, { align: 'center' });

  let y = 35;

  /* ── SECTION: Company Info ──────────────────────── */
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 90);
  doc.text(`${COMPANY}   |   GSTIN: ${GSTIN}   |   PAN: ${PAN}`, ML, y);
  doc.text(`${ADDR_LINE1}, ${ADDR_LINE2}`, ML, y + 4.5);

  y += 12;

  /* ── KPI CARDS ROW ────────────────────────────────── */
  const totalSpend  = PROVIDER_DATA.reduce((s, p) => s + p.cost, 0);
  const totalBudget = PROVIDER_DATA.reduce((s, p) => s + p.budget, 0);
  const budgetUsed  = Math.round((totalSpend / totalBudget) * 100);
  const totalTokens = PROVIDER_DATA.reduce((s, p) => s + p.tokens, 0);
  const gstAmt      = Math.round(totalSpend * 0.18);

  const kpis = [
    { label: 'Total AI API Spend',   value: inrLakh(totalSpend),   sub: `Excl. GST`,      accent: [15, 98, 254]   },
    { label: 'Allocated Budget',     value: inrLakh(totalBudget),  sub: `Monthly Cap`,    accent: [20, 140, 60]   },
    { label: 'Budget Utilisation',   value: budgetUsed + '%',      sub: pctLabel(budgetUsed), accent: pctRgb(budgetUsed) },
    { label: 'Total Tokens',         value: tokensLabel(totalTokens), sub: 'All providers', accent: [107, 60, 200]  },
    { label: 'GST Liability (18%)',  value: inrLakh(gstAmt),       sub: 'IGST / CGST+SGST',accent: [180, 100, 0]  },
  ];

  const kW = (body - 4 * 3) / 5;  // 5 cards, 3mm gap
  kpis.forEach((k, i) => {
    const x = ML + i * (kW + 3);
    // Card bg
    doc.setFillColor(248, 249, 251);
    doc.roundedRect(x, y, kW, 22, 2, 2, 'F');
    // Left accent
    doc.setFillColor(...k.accent);
    doc.roundedRect(x, y, 2.5, 22, 1, 1, 'F');
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 110);
    doc.text(k.label, x + 5, y + 6);
    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...k.accent);
    doc.text(k.value, x + 5, y + 14);
    // Sub
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...k.accent);
    doc.text(k.sub, x + 5, y + 20);
  });

  y += 28;

  /* ── SECTION RULE ─────────────────────────────────── */
  function sectionHead(label, yy) {
    doc.setFillColor(230, 234, 242);
    doc.rect(ML, yy, body, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 50, 90);
    doc.text(label, ML + 3, yy + 4.2);
    return yy + 9;
  }

  /* ── AI PROVIDER BREAKDOWN TABLE ─────────────────── */
  y = sectionHead('AI PROVIDER BREAKDOWN — JULY 2026', y);

  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Provider',         styles: { halign: 'left'  } },
      { content: 'Category',         styles: { halign: 'left'  } },
      { content: 'Tokens Consumed',  styles: { halign: 'right' } },
      { content: 'Cost (excl. GST)', styles: { halign: 'right' } },
      { content: 'GST 18%',          styles: { halign: 'right' } },
      { content: 'Total Cost',       styles: { halign: 'right' } },
      { content: 'Budget Alloc.',    styles: { halign: 'right' } },
      { content: 'Utilisation',      styles: { halign: 'center'} },
      { content: 'Policy',           styles: { halign: 'center'} },
    ]],
    body: PROVIDER_DATA.map(p => {
      const gst   = Math.round(p.cost * 0.18);
      const total = p.cost + gst;
      return [
        p.name,
        p.category,
        { content: tokensLabel(p.tokens), styles: { halign: 'right', font: 'courier' } },
        { content: inrFull(p.cost),       styles: { halign: 'right', font: 'courier' } },
        { content: inrFull(gst),          styles: { halign: 'right', font: 'courier' } },
        { content: inrFull(total),        styles: { halign: 'right', font: 'courier', fontStyle: 'bold' } },
        { content: inrFull(p.budget),     styles: { halign: 'right', font: 'courier' } },
        { content: p.budgetPct + '%',     styles: { halign: 'center' } },
        { content: pctLabel(p.budgetPct), styles: { halign: 'center' } },
      ];
    }),
    headStyles: {
      fillColor: [18, 18, 20],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 30, 40],
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: [245, 246, 250] },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 22 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 17 },
      5: { cellWidth: 22 },
      6: { cellWidth: 18 },
      7: { cellWidth: 14 },
      8: { cellWidth: 19 },
    },
    willDrawCell(data) {
      // Colour utilisation and policy cells
      if (data.section !== 'body') return;
      const row = PROVIDER_DATA[data.row.index];
      if (!row) return;
      const [r, g, b] = pctRgb(row.budgetPct);
      if (data.column.index === 7) { // utilisation
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 8) { // policy
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    // Footer totals row
    foot: [[
      { content: 'TOTALS', styles: { fontStyle:'bold', halign:'left' } },
      { content: '' },
      { content: tokensLabel(PROVIDER_DATA.reduce((s,p)=>s+p.tokens,0)), styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: inrFull(PROVIDER_DATA.reduce((s,p)=>s+p.cost,0)),        styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: inrFull(Math.round(PROVIDER_DATA.reduce((s,p)=>s+p.cost,0)*0.18)), styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: inrFull(Math.round(PROVIDER_DATA.reduce((s,p)=>s+p.cost*(1.18),0))), styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: inrFull(PROVIDER_DATA.reduce((s,p)=>s+p.budget,0)),      styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: budgetUsed + '%', styles: { halign:'center', fontStyle:'bold', textColor: pctRgb(budgetUsed) } },
      { content: pctLabel(budgetUsed), styles: { halign:'center', fontStyle:'bold', textColor: pctRgb(budgetUsed) } },
    ]],
    footStyles: {
      fillColor: [18, 18, 20],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    showFoot: 'lastPage',
    showHead: 'firstPage',
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ── POLICY LEGEND ──────────────────────────────── */
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 70);
  doc.text('Policy Thresholds: ', ML, y);
  const legItems = [
    { label: '< 80% — Normal Operation', rgb: [20, 140, 60] },
    { label: '≥ 80% — Warning / Throttling Active', rgb: [175, 95, 0] },
    { label: '≥ 100% — Hard Cap: API Key Blocked', rgb: [200, 20, 30] },
  ];
  let lx = ML + 28;
  doc.setFont('helvetica', 'normal');
  legItems.forEach(l => {
    doc.setFillColor(...l.rgb);
    doc.rect(lx, y - 2.5, 2.5, 2.5, 'F');
    doc.setTextColor(...l.rgb);
    doc.text(l.label, lx + 4, y);
    lx += doc.getTextWidth(l.label) + 9;
  });

  y += 8;

  /* ── TAX SUMMARY BOX ────────────────────────────── */
  y = sectionHead('TAX SUMMARY & BILLING REFERENCE', y);

  const netAmt    = PROVIDER_DATA.reduce((s, p) => s + p.cost, 0);
  const gstTotal  = Math.round(netAmt * 0.18);
  const invoiceNo = `VTG-2026-07-INV-0041`;
  const dueDate   = '15 Aug 2026';

  const boxW = (body - 5) / 2;

  // Left: tax breakdown
  doc.setFillColor(248, 249, 251);
  doc.rect(ML, y, boxW, 32, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, boxW, 32);

  const taxRows = [
    ['Invoice Number',       invoiceNo],
    ['Invoice Date',         '31 Jul 2026'],
    ['Due Date',             dueDate],
    ['Net Amount (excl. GST)', inrFull(netAmt)],
    ['IGST @ 18%',           inrFull(gstTotal)],
    ['Total Payable',        inrFull(netAmt + gstTotal)],
  ];
  taxRows.forEach((r, i) => {
    const ry = y + 5 + i * 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 100);
    doc.text(r[0], ML + 3, ry);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 30);
    doc.text(r[1], ML + boxW - 3, ry, { align: 'right' });
  });

  // Right: entity details
  const rx2 = ML + boxW + 5;
  doc.setFillColor(248, 249, 251);
  doc.rect(rx2, y, boxW, 32, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.rect(rx2, y, boxW, 32);

  const entRows = [
    ['Entity',             COMPANY],
    ['GSTIN',              GSTIN],
    ['PAN',                PAN],
    ['Billing Address',    ADDR_LINE1],
    ['',                   ADDR_LINE2],
    ['Payment Terms',      'Net 15 days from invoice date'],
  ];
  entRows.forEach((r, i) => {
    const ry = y + 5 + i * 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 100);
    if (r[0]) doc.text(r[0], rx2 + 3, ry);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 30);
    doc.text(r[1], rx2 + boxW - 3, ry, { align: 'right' });
  });

  y += 38;

  /* ── EXECUTIVE SIGN-OFF ─────────────────────────── */
  y = sectionHead('EXECUTIVE SIGN-OFF — COMPLIANCE APPROVAL', y);

  const sigCols = [
    { role: 'Finance Director / CFO', name: opts.sigName || '' },
    { role: 'CISO / Security Lead',   name: '' },
    { role: 'CTO / Head of Engineering', name: '' },
  ];
  const sigW = (body - 2 * 8) / 3;

  sigCols.forEach((s, i) => {
    const sx = ML + i * (sigW + 8);
    const sy = y;

    // Box
    doc.setDrawColor(200, 200, 210);
    doc.setLineWidth(0.3);
    doc.rect(sx, sy, sigW, 22);

    // Role label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 50, 90);
    doc.text(s.role, sx + 3, sy + 6);

    // Signature line
    doc.setDrawColor(80, 80, 100);
    doc.setLineWidth(0.4);
    doc.line(sx + 3, sy + 14, sx + sigW - 3, sy + 14);

    if (s.name) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(60, 60, 80);
      doc.text(s.name, sx + 3, sy + 12);
    }

    // Date line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 130);
    doc.text('Signature & Date', sx + 3, sy + 19);
  });

  y += 26;

  /* ── FOOTER ─────────────────────────────────────── */
  doc.setFillColor(18, 18, 20);
  doc.rect(0, 285, W, 12, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 160);
  doc.text(`${COMPANY}   ·   GSTIN: ${GSTIN}   ·   Vantage AI Platform`, ML, 290.5);
  doc.setTextColor(100, 120, 200);
  doc.text('CONFIDENTIAL — For Internal Use, Billing & Tax Compliance Only', W / 2, 290.5, { align: 'center' });
  doc.text('Page 1', W - MR, 290.5, { align: 'right' });
}

/* ─────────────────────────────────────────────────────────────
   PAGE 2 — TELEMETRY APPENDIX (Landscape A4)
   Safe area: 297 × 210 mm  |  margins: L/R=14
───────────────────────────────────────────────────────────── */
function buildPage2(doc, opts) {
  const W = 297, ML = 14, MR = 14;

  /* ── TOP HEADER ───────────────────────────────────── */
  doc.setFillColor(18, 18, 20);
  doc.rect(0, 0, W, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('VANTAGE AI — ITEMISED TELEMETRY APPENDIX', ML, 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 160);
  doc.text(`Period: ${opts.period}   ·   Workspace: ${opts.workspace}   ·   CONFIDENTIAL`, W - MR, 9, { align: 'right' });

  doc.setFillColor(15, 98, 254);
  doc.rect(0, 14, W, 4, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Raw API Call Log — Exact token economics per call. Loop Detection: completion ÷ prompt > 8×.', ML, 16.8);
  doc.text('IGST @ 18% applies on all AI API charges per India GST Schedule II.', W - MR, 16.8, { align: 'right' });

  let y = 22;

  /* ── TELEMETRY TABLE ───────────────────────────────── */
  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Timestamp',        styles: { halign: 'left'   } },
      { content: 'Employee ID',      styles: { halign: 'left'   } },
      { content: 'Workspace',        styles: { halign: 'left'   } },
      { content: 'Provider',         styles: { halign: 'left'   } },
      { content: 'Model Tier',       styles: { halign: 'left'   } },
      { content: 'Prompt Tok.',      styles: { halign: 'right'  } },
      { content: 'Completion Tok.',  styles: { halign: 'right'  } },
      { content: 'Cost/Tok (₹)',     styles: { halign: 'right'  } },
      { content: 'Total Cost (₹)',   styles: { halign: 'right'  } },
      { content: 'GST 18% (₹)',      styles: { halign: 'right'  } },
      { content: 'Inv. Total (₹)',   styles: { halign: 'right'  } },
      { content: 'Policy',           styles: { halign: 'center' } },
      { content: 'Loop?',            styles: { halign: 'center' } },
    ]],
    body: TELEMETRY.map(r => {
      const pricing   = MODEL_PRICING[r.model] || { prompt: 0, completion: 0 };
      const costCheck = Math.round(r.prompt * pricing.prompt + r.completion * pricing.completion);
      const gst       = Math.round(r.cost * 0.18);
      const total     = r.cost + gst;
      const costPTok  = ((pricing.prompt + pricing.completion) / 2).toFixed(6);
      return [
        { content: r.ts,                        styles: { font: 'courier', fontSize: 6.5, textColor: [60,60,80] } },
        { content: r.eid,                       styles: { font: 'courier', fontSize: 6.5, textColor: [15,80,200] } },
        { content: r.workspace,                 styles: { fontSize: 7 } },
        { content: r.provider,                  styles: { fontSize: 7 } },
        { content: r.model,                     styles: { font: 'courier', fontSize: 6.5 } },
        { content: r.prompt.toLocaleString('en-IN'),      styles: { halign: 'right', font: 'courier', fontSize: 7 } },
        { content: r.completion.toLocaleString('en-IN'),  styles: { halign: 'right', font: 'courier', fontSize: 7 } },
        { content: '₹' + costPTok,              styles: { halign: 'right', font: 'courier', fontSize: 6.5 } },
        { content: inrFull(r.cost),             styles: { halign: 'right', font: 'courier', fontSize: 7 } },
        { content: inrFull(gst),                styles: { halign: 'right', font: 'courier', fontSize: 7 } },
        { content: inrFull(total),              styles: { halign: 'right', font: 'courier', fontSize: 7, fontStyle: 'bold' } },
        { content: pctLabel(r.budgetPct),       styles: { halign: 'center', fontSize: 6.5 } },
        { content: r.loop ? 'LOOP !' : '—',    styles: { halign: 'center', fontSize: 6.5 } },
      ];
    }),
    headStyles: {
      fillColor: [18, 18, 20],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [25, 25, 35],
      cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
    },
    alternateRowStyles: { fillColor: [245, 247, 252] },
    columnStyles: {
      0:  { cellWidth: 28 },
      1:  { cellWidth: 22 },
      2:  { cellWidth: 22 },
      3:  { cellWidth: 20 },
      4:  { cellWidth: 32 },
      5:  { cellWidth: 18 },
      6:  { cellWidth: 22 },
      7:  { cellWidth: 18 },
      8:  { cellWidth: 18 },
      9:  { cellWidth: 18 },
      10: { cellWidth: 20 },
      11: { cellWidth: 15 },
      12: { cellWidth: 12 },
    },
    willDrawCell(data) {
      if (data.section !== 'body') return;
      const row = TELEMETRY[data.row.index];
      if (!row) return;
      const [r, g, b] = pctRgb(row.budgetPct);
      // Policy column
      if (data.column.index === 11) {
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = 'bold';
      }
      // Loop column
      if (data.column.index === 12 && row.loop) {
        data.cell.styles.textColor = [200, 20, 30];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 240, 240];
      }
    },
    // Running totals foot
    foot: [[
      { content: 'TOTALS', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: TELEMETRY.reduce((s,r)=>s+r.prompt,0).toLocaleString('en-IN'), styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: TELEMETRY.reduce((s,r)=>s+r.completion,0).toLocaleString('en-IN'), styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: '' },
      { content: inrFull(TELEMETRY.reduce((s,r)=>s+r.cost,0)), styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: inrFull(Math.round(TELEMETRY.reduce((s,r)=>s+r.cost,0)*0.18)), styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: inrFull(Math.round(TELEMETRY.reduce((s,r)=>s+r.cost,0)*1.18)), styles: { halign:'right', fontStyle:'bold', font:'courier' } },
      { content: '' },
      { content: `${TELEMETRY.filter(r=>r.loop).length} loop(s) detected`, styles: { halign:'center', fontStyle:'bold', textColor:[200,20,30] } },
    ]],
    footStyles: {
      fillColor: [18, 18, 20],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
    },
    showFoot: 'lastPage',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    didDrawPage(data) {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      // Per-page footer
      doc.setFillColor(18, 18, 20);
      doc.rect(0, 203, W, 7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(140, 140, 160);
      doc.text(`${COMPANY}  ·  GSTIN: ${GSTIN}  ·  Vantage AI Platform`, ML, 207);
      doc.text('CONFIDENTIAL — Telemetry Appendix. For tax, audit & billing use only.', W / 2, 207, { align: 'center' });
      doc.text(`Page ${pg}`, W - MR, 207, { align: 'right' });
    },
  });
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT FUNCTION
───────────────────────────────────────────────────────────── */
export async function exportVantagePDF(options = {}) {
  const opts = {
    period:         options.period         || 'July 2026',
    workspace:      options.workspace      || COMPANY,
    sigName:        options.sigName        || '',
    includeAppendix:options.includeAppendix !== false,
  };

  if (!window.jspdf?.jsPDF) {
    window.showToast?.('PDF library not loaded. Refresh and try again.', 'error');
    return;
  }

  // Disable all PDF-trigger buttons
  document.querySelectorAll('[data-pdf-trigger]').forEach(b => {
    b.disabled = true;
    b.setAttribute('aria-busy', 'true');
  });
  showProgress();

  // WebGL safety
  const splineIframe    = document.getElementById('spline-bg-iframe');
  const splineContainer = document.getElementById('spline-bg-container');
  if (splineIframe)    splineIframe.style.visibility    = 'hidden';
  if (splineContainer) splineContainer.style.visibility = 'hidden';

  // Allow repaint
  await new Promise(r => setTimeout(r, 80));

  try {
    const { jsPDF } = window.jspdf;

    // Page 1 — Portrait A4
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    buildPage1(doc, opts);

    // Page 2+ — Landscape A4
    if (opts.includeAppendix) {
      doc.addPage([297, 210], 'landscape');
      buildPage2(doc, opts);
    }

    const filename = `Vantage_Executive_Report_${opts.period.replace(/\s/g, '_')}.pdf`;
    doc.save(filename);
    finishProgress();
    window.showToast?.(`Downloaded — ${filename}`, 'success');

  } catch (err) {
    console.error('[PDF] Generation failed:', err);
    finishProgress();
    window.showToast?.('PDF generation failed. Check console for details.', 'error');
  } finally {
    // Restore WebGL
    if (splineIframe)    splineIframe.style.visibility    = '';
    if (splineContainer) splineContainer.style.visibility = '';
    document.querySelectorAll('[data-pdf-trigger]').forEach(b => {
      b.disabled = false;
      b.removeAttribute('aria-busy');
    });
  }
}
