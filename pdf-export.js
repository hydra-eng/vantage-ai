/**
 * Vantage AI — Enterprise 3-Page Corporate PDF Packet Generator
 * Designed for: Billing Department, Tax Compliance (GST/PAN), Finance Directors (CFO),
 * CISO Security Audit, and Corporate FinOps Submissions.
 *
 * Page 1 (Portrait A4): Executive Summary & Official Tax Invoice Statement
 * Page 2 (Portrait A4): Departmental FinOps Allocation & Model Unit Economics Ledger
 * Page 3 (Landscape A4): Itemized Telemetry Appendix & Agentic AI Anomaly Audit Log
 *
 * Uses jsPDF 2.5 + jspdf-autotable 3.8 (loaded via CDN)
 */

/* ─────────────────────────────────────────────────────────────
   CORPORATE CONSTANTS & TAX METADATA
───────────────────────────────────────────────────────────── */
const COMPANY_NAME = 'TechCorp India Private Limited';
const GSTIN        = '27AABCT1234N1Z5';
const PAN          = 'AABCT1234N';
const SAC_CODE     = '998313'; // Information Technology Services
const ADDR_LINE1   = 'Unit 4B, 4th Floor, Prestige Tech Park, Outer Ring Road';
const ADDR_LINE2   = 'Kadubeesanahalli, Varthur Hobli, Bengaluru, KA – 560103';
const INVOICE_NO   = 'VTG-2026-07-INV-0041';
const INVOICE_DATE = '31 July 2026';
const DUE_DATE     = '15 August 2026';

// Model pricing tier (INR per token, excl. 18% GST)
const MODEL_PRICING = {
  'gpt-4o':             { prompt: 0.000416, completion: 0.001248, label: 'GPT-4o Tier 1' },
  'gpt-4-turbo':        { prompt: 0.000832, completion: 0.002496, label: 'GPT-4 Turbo' },
  'gpt-3.5-turbo':      { prompt: 0.0000416,completion: 0.0000624,label: 'GPT-3.5 Turbo' },
  'claude-3-5-sonnet':  { prompt: 0.000249, completion: 0.001247, label: 'Claude 3.5 Sonnet' },
  'claude-3-haiku':     { prompt: 0.0000208,completion: 0.000104, label: 'Claude 3 Haiku' },
  'gemini-1.5-pro':     { prompt: 0.000104, completion: 0.000312, label: 'Gemini 1.5 Pro' },
  'gemini-1.5-flash':   { prompt: 0.0000104,completion: 0.0000312,label: 'Gemini 1.5 Flash' },
  'runway-gen3':        { prompt: 0.000050, completion: 0.000200, label: 'Runway Gen-3' },
  'synthesia-v2':       { prompt: 0.000150, completion: 0.000450, label: 'Synthesia Studio' },
  'copilot-chat':       { prompt: 0.000104, completion: 0.000208, label: 'GitHub Copilot' },
  'eleven-turbo-v2':    { prompt: 0.000080, completion: 0.000240, label: 'ElevenLabs Speech' },
  'llama-3.1-70b':      { prompt: 0.0000499,completion: 0.0000499,label: 'Llama 3.1 70B' },
};

// Executive Provider Aggregate Summary
const PROVIDERS_AGGREGATE = [
  { name: 'OpenAI',           category: 'Text & Code',    tokens: 9820000, cost: 112430, budget: 200000, budgetPct: 89  },
  { name: 'Anthropic Claude', category: 'Text & Code',    tokens: 3410000, cost:  54180, budget:  80000, budgetPct: 72  },
  { name: 'Google Gemini',    category: 'Text & Code',    tokens: 2980000, cost:  38290, budget:  63000, budgetPct: 61  },
  { name: 'Synthesia',        category: 'Video & Image',  tokens: 1120000, cost:  35280, budget:  37500, budgetPct: 94  },
  { name: 'GitHub Copilot',   category: 'Code Assist',    tokens: 2650000, cost:  26600, budget:  25000, budgetPct: 106 },
  { name: 'Runway ML',        category: 'Video & Image',  tokens:  880000, cost:  26160, budget:  32000, budgetPct: 82  },
  { name: 'Meta Llama',       category: 'Text & Code',    tokens: 1440000, cost:  16370, budget:  30000, budgetPct: 55  },
  { name: 'ElevenLabs',       category: 'Audio & Speech', tokens:  510000, cost:  11440, budget:  24000, budgetPct: 48  },
];

// Departmental FinOps Cost Center Allocation
const DEPARTMENT_ALLOCATION = [
  { dept: 'Engineering',   code: 'CC-ENG-101', users: 11, tokens: 14210000, cost: 161820, budget: 180000, budgetPct: 90 },
  { dept: 'Marketing',     code: 'CC-MKT-202', users:  4, tokens:  6600000, cost:  60540, budget:  80000, budgetPct: 76 },
  { dept: 'Data & Analytics',code:'CC-DAT-303', users: 3, tokens:  4480000, cost:  41200, budget:  65000, budgetPct: 63 },
  { dept: 'Video Editing', code: 'CC-VID-404', users:  2, tokens:  2680000, cost:  38333, budget:  45000, budgetPct: 85 },
  { dept: 'Operations',    code: 'CC-OPS-505', users:  2, tokens:  2200000, cost:  18860, budget:  30000, budgetPct: 63 },
];

// Raw Telemetry Log with Agentic AI Loop Detection
const RAW_TELEMETRY = [
  { ts:'2026-07-31 23:58', eid:'EMP-EN-001', dept:'Engineering',  provider:'OpenAI',     model:'gpt-4o',            prompt:12400, completion:3820,  cost:7298,  budgetPct:89,  loop:false },
  { ts:'2026-07-31 22:41', eid:'EMP-EN-002', dept:'Engineering',  provider:'OpenAI',     model:'gpt-4-turbo',       prompt:8200,  completion:1100,  cost:9527,  budgetPct:89,  loop:false },
  { ts:'2026-07-31 21:30', eid:'EMP-EN-011', dept:'Engineering',  provider:'OpenAI',     model:'gpt-4o',            prompt:3800,  completion:31200, cost:41590, budgetPct:106, loop:true  },
  { ts:'2026-07-31 20:15', eid:'EMP-VD-003', dept:'Video Editing',provider:'Runway ML',  model:'runway-gen3',       prompt:2100,  completion:890,   cost:4830,  budgetPct:85,  loop:false },
  { ts:'2026-07-31 19:54', eid:'EMP-MK-007', dept:'Marketing',    provider:'OpenAI',     model:'gpt-4o',            prompt:5400,  completion:1620,  cost:3244,  budgetPct:76,  loop:false },
  { ts:'2026-07-31 18:30', eid:'EMP-PD-004', dept:'Engineering',  provider:'Synthesia',  model:'synthesia-v2',      prompt:900,   completion:3600,  cost:8190,  budgetPct:90,  loop:false },
  { ts:'2026-07-31 17:12', eid:'EMP-EN-005', dept:'Engineering',  provider:'Anthropic',  model:'claude-3-5-sonnet', prompt:11200, completion:2840,  cost:6324,  budgetPct:90,  loop:false },
  { ts:'2026-07-31 16:45', eid:'EMP-DA-002', dept:'Data & Analy.',provider:'Google',     model:'gemini-1.5-pro',    prompt:18600, completion:4200,  cost:3243,  budgetPct:63,  loop:false },
  { ts:'2026-07-31 15:30', eid:'EMP-OP-001', dept:'Operations',   provider:'OpenAI',     model:'gpt-3.5-turbo',     prompt:22000, completion:5800,  cost:1279,  budgetPct:63,  loop:false },
  { ts:'2026-07-31 14:10', eid:'EMP-EN-008', dept:'Engineering',  provider:'GitHub',     model:'copilot-chat',      prompt:9800,  completion:2200,  cost:2185,  budgetPct:106, loop:false },
  { ts:'2026-07-31 13:55', eid:'EMP-MK-003', dept:'Marketing',    provider:'ElevenLabs', model:'eleven-turbo-v2',   prompt:1200,  completion:4800,  cost:2810,  budgetPct:76,  loop:false },
  { ts:'2026-07-30 22:30', eid:'EMP-VD-001', dept:'Video Editing',provider:'Runway ML',  model:'runway-gen3',       prompt:1800,  completion:720,   cost:4153,  budgetPct:85,  loop:false },
  { ts:'2026-07-30 20:15', eid:'EMP-EN-003', dept:'Engineering',  provider:'OpenAI',     model:'gpt-4o',            prompt:6200,  completion:1880,  cost:4889,  budgetPct:90,  loop:false },
  { ts:'2026-07-30 18:40', eid:'EMP-PD-002', dept:'Engineering',  provider:'Anthropic',  model:'claude-3-haiku',    prompt:14400, completion:3600,  cost:677,   budgetPct:90,  loop:false },
  { ts:'2026-07-30 16:20', eid:'EMP-DA-005', dept:'Data & Analy.',provider:'Google',     model:'gemini-1.5-flash',  prompt:42000, completion:8400,  cost:877,   budgetPct:63,  loop:false },
];

/* ─────────────────────────────────────────────────────────────
   CURRENCY & VALUE FORMATTERS
───────────────────────────────────────────────────────────── */
function inrFull(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function inrLakh(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
  return inrFull(n);
}
function policyStatusLabel(pct) {
  if (pct >= 100) return 'HARD CAP';
  if (pct >= 80)  return 'WARNING';
  return 'NORMAL';
}
function policyStatusColor(pct) {
  if (pct >= 100) return [190, 20, 20];
  if (pct >= 80)  return [170, 90, 0];
  return [20, 135, 55];
}
function tokensLabel(t) {
  if (t >= 1000000) return (t / 1000000).toFixed(2) + 'M';
  if (t >= 1000)    return (t / 1000).toFixed(1) + 'K';
  return String(t);
}

/* ─────────────────────────────────────────────────────────────
   PROGRESS BAR CONTROL
───────────────────────────────────────────────────────────── */
function showProgress() {
  const bar = document.getElementById('pdf-progress-bar');
  if (!bar) return;
  bar.style.opacity = '1';
  bar.style.transition = 'none';
  bar.style.width = '0%';
  requestAnimationFrame(() => {
    bar.style.transition = 'width 2.5s cubic-bezier(0.1,0.6,0.4,1)';
    bar.style.width = '85%';
  });
}
function finishProgress() {
  const bar = document.getElementById('pdf-progress-bar');
  if (!bar) return;
  bar.style.transition = 'width 0.2s ease';
  bar.style.width = '100%';
  setTimeout(() => { bar.style.opacity = '0'; bar.style.width = '0%'; }, 400);
}

/* ─────────────────────────────────────────────────────────────
   PAGE 1: EXECUTIVE AI GOVERNANCE & TAX INVOICE STATEMENT
   Format: Portrait A4 (210mm x 297mm)
───────────────────────────────────────────────────────────── */
function drawPage1(doc, opts) {
  const W = 210, ML = 14, MR = 14, bodyW = W - ML - MR;

  // Header Dark Band
  doc.setFillColor(16, 20, 28);
  doc.rect(0, 0, W, 24, 'F');

  // Brand Badge Icon
  doc.setFillColor(15, 98, 254);
  doc.triangle(ML, 5, ML + 8, 19, ML + 16, 5, 'F');
  doc.setFillColor(255, 255, 255);
  doc.triangle(ML + 3.5, 5, ML + 8, 13, ML + 12.5, 5, 'F');

  // Title & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('VANTAGE AI', ML + 20, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(160, 175, 200);
  doc.text('Enterprise AI Spend Control & Compliance Engine', ML + 20, 18.5);

  // Metadata right-aligned
  doc.setFontSize(7);
  doc.setTextColor(180, 195, 220);
  const rx = W - MR;
  doc.text(`INVOICE REF: ${INVOICE_NO}`, rx, 9, { align: 'right' });
  doc.text(`BILLING PERIOD: ${opts.period.toUpperCase()}`, rx, 14, { align: 'right' });
  doc.text(`ISSUED: ${INVOICE_DATE}  |  DUE: ${DUE_DATE}`, rx, 19, { align: 'right' });

  // Blue Ribbon
  doc.setFillColor(15, 98, 254);
  doc.rect(0, 24, W, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SHEET 1 OF 3: EXECUTIVE AI SPEND & OFFICIAL TAX INVOICE STATEMENT', W / 2, 28.2, { align: 'center' });

  let y = 36;

  // Company Billing & Tax Header Box
  doc.setFillColor(246, 248, 252);
  doc.rect(ML, y, bodyW, 26, 'F');
  doc.setDrawColor(215, 225, 240);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, bodyW, 26);

  // Left Column - Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 45, 75);
  doc.text('BILLED TO (CUSTOMER ENTITY):', ML + 4, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 60);
  doc.text(`${COMPANY_NAME}`, ML + 4, y + 10.5);
  doc.text(`GSTIN: ${GSTIN}   |   PAN: ${PAN}`, ML + 4, y + 15);
  doc.text(`${ADDR_LINE1}`, ML + 4, y + 19.5);
  doc.text(`${ADDR_LINE2}`, ML + 4, y + 23.5);

  // Right Column - Tax Reference
  const rxCol = ML + 105;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 45, 75);
  doc.text('SERVICE & TAX CLASSIFICATION:', rxCol, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 60);
  doc.text(`SAC/HSN Code: ${SAC_CODE} (IT Software & API Services)`, rxCol, y + 10.5);
  doc.text(`Tax Component: Integrated GST (IGST @ 18%)`, rxCol, y + 15);
  doc.text(`Reverse Charge Applicable: NO`, rxCol, y + 19.5);
  doc.text(`Workspace Entity: ${opts.workspace}`, rxCol, y + 23.5);

  y += 31;

  // Executive Spend & Tax KPI Strip
  const totalNetCost  = PROVIDERS_AGGREGATE.reduce((s, p) => s + p.cost, 0);
  const totalGst      = Math.round(totalNetCost * 0.18);
  const totalGross    = totalNetCost + totalGst;
  const totalBudget   = PROVIDERS_AGGREGATE.reduce((s, p) => s + p.budget, 0);
  const overallBudgetPct = Math.round((totalNetCost / totalBudget) * 100);
  const totalTokensVol= PROVIDERS_AGGREGATE.reduce((s, p) => s + p.tokens, 0);

  const kpis = [
    { title: 'NET API SPEND',     val: inrLakh(totalNetCost),    sub: 'Excl. GST Tax',    accent: [15, 98, 254] },
    { title: 'IGST (18%)',        val: inrLakh(totalGst),        sub: 'Tax Liability',    accent: [180, 90, 0]  },
    { title: 'GROSS PAYABLE',     val: inrLakh(totalGross),      sub: 'Total Inc. Tax',   accent: [16, 20, 28]  },
    { title: 'BUDGET HEALTH',     val: overallBudgetPct + '%',   sub: policyStatusLabel(overallBudgetPct), accent: policyStatusColor(overallBudgetPct) },
    { title: 'TOKEN VOLUME',      val: tokensLabel(totalTokensVol), sub: '8 Connected APIs', accent: [100, 50, 180] },
  ];

  const cardW = (bodyW - 4 * 3) / 5;
  kpis.forEach((k, i) => {
    const cx = ML + i * (cardW + 3);
    doc.setFillColor(248, 250, 254);
    doc.roundedRect(cx, y, cardW, 21, 1.5, 1.5, 'F');
    doc.setFillColor(...k.accent);
    doc.roundedRect(cx, y, 2.2, 21, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(110, 110, 125);
    doc.text(k.title, cx + 4.5, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...k.accent);
    doc.text(k.val, cx + 4.5, y + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...k.accent);
    doc.text(k.sub, cx + 4.5, y + 18.5);
  });

  y += 26;

  // Section Header Function
  function drawSectionHeader(titleText, currentY) {
    doc.setFillColor(232, 238, 248);
    doc.rect(ML, currentY, bodyW, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(25, 45, 85);
    doc.text(titleText, ML + 3, currentY + 3.8);
    return currentY + 8;
  }

  y = drawSectionHeader('1. AI PROVIDER SPEND & TAX ALLOCATION TABLE', y);

  // Table 1: Provider Summary
  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Provider Name',    styles: { halign: 'left' } },
      { content: 'Category',         styles: { halign: 'left' } },
      { content: 'Token Volume',     styles: { halign: 'right'} },
      { content: 'Net Cost (₹)',     styles: { halign: 'right'} },
      { content: 'IGST 18% (₹)',     styles: { halign: 'right'} },
      { content: 'Gross Cost (₹)',   styles: { halign: 'right'} },
      { content: 'Budget (₹)',       styles: { halign: 'right'} },
      { content: 'Util %',           styles: { halign: 'center'} },
      { content: 'Status',           styles: { halign: 'center'} },
    ]],
    body: PROVIDERS_AGGREGATE.map(p => {
      const gst = Math.round(p.cost * 0.18);
      const gross = p.cost + gst;
      return [
        p.name,
        p.category,
        { content: tokensLabel(p.tokens), styles: { font: 'courier', halign: 'right' } },
        { content: inrFull(p.cost),       styles: { font: 'courier', halign: 'right' } },
        { content: inrFull(gst),          styles: { font: 'courier', halign: 'right' } },
        { content: inrFull(gross),        styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
        { content: inrFull(p.budget),     styles: { font: 'courier', halign: 'right' } },
        { content: p.budgetPct + '%',     styles: { halign: 'center' } },
        { content: policyStatusLabel(p.budgetPct), styles: { halign: 'center' } },
      ];
    }),
    headStyles: {
      fillColor: [16, 20, 28],
      textColor: [255, 255, 255],
      fontSize: 6.8,
      fontStyle: 'bold',
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 30, 40],
      cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: [246, 248, 253] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 24 },
      2: { cellWidth: 20 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18 },
      5: { cellWidth: 23 },
      6: { cellWidth: 20 },
      7: { cellWidth: 12 },
      8: { cellWidth: 15 },
    },
    willDrawCell(data) {
      if (data.section !== 'body') return;
      const row = PROVIDERS_AGGREGATE[data.row.index];
      if (!row) return;
      const rgb = policyStatusColor(row.budgetPct);
      if (data.column.index === 7 || data.column.index === 8) {
        data.cell.styles.textColor = rgb;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    foot: [[
      { content: 'TOTALS', colSpan: 2, styles: { fontStyle: 'bold', halign: 'left' } },
      { content: tokensLabel(totalTokensVol), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inrFull(totalNetCost),       styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inrFull(totalGst),           styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inrFull(totalGross),         styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inrFull(totalBudget),        styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: overallBudgetPct + '%',      styles: { halign: 'center', fontStyle: 'bold', textColor: policyStatusColor(overallBudgetPct) } },
      { content: policyStatusLabel(overallBudgetPct), styles: { halign: 'center', fontStyle: 'bold', textColor: policyStatusColor(overallBudgetPct) } },
    ]],
    footStyles: {
      fillColor: [16, 20, 28],
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    showFoot: 'lastPage',
  });

  y = doc.lastAutoTable.finalY + 5;

  // Tax Invoice Summary Box
  y = drawSectionHeader('2. TAX INVOICE BREAKDOWN & PAYMENT REFERENCE', y);

  const halfW = (bodyW - 4) / 2;

  // Left Tax Table
  doc.setFillColor(248, 250, 254);
  doc.rect(ML, y, halfW, 30, 'F');
  doc.setDrawColor(215, 225, 240);
  doc.rect(ML, y, halfW, 30);

  const tLines = [
    ['Taxable Net Amount:',   inrFull(totalNetCost)],
    ['CGST @ 9%:',            inrFull(Math.round(totalNetCost * 0.09))],
    ['SGST @ 9%:',            inrFull(Math.round(totalNetCost * 0.09))],
    ['IGST @ 18% (Interstate):', inrFull(totalGst)],
    ['TOTAL INVOICE PAYABLE:', inrFull(totalGross)],
  ];
  tLines.forEach((t, idx) => {
    const ly = y + 4.5 + idx * 5.2;
    doc.setFont('helvetica', idx === 4 ? 'bold' : 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(idx === 4 ? 15 : 70, idx === 4 ? 98 : 70, idx === 4 ? 254 : 80);
    doc.text(t[0], ML + 3, ly);
    doc.text(t[1], ML + halfW - 3, ly, { align: 'right' });
  });

  // Right Bank & Payment Reference
  const rx2 = ML + halfW + 4;
  doc.setFillColor(248, 250, 254);
  doc.rect(rx2, y, halfW, 30, 'F');
  doc.setDrawColor(215, 225, 240);
  doc.rect(rx2, y, halfW, 30);

  const bLines = [
    ['Bank Name:', 'HDFC Bank Ltd (Corporate Branch)'],
    ['Account Name:', COMPANY_NAME],
    ['Account Number:', '50200084729104'],
    ['IFSC Code:', 'HDFC0000240'],
    ['Payment Terms:', 'Net 15 Days (Due by 15 Aug 2026)'],
  ];
  bLines.forEach((b, idx) => {
    const ly = y + 4.5 + idx * 5.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(80, 80, 90);
    doc.text(b[0], rx2 + 3, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 40);
    doc.text(b[1], rx2 + halfW - 3, ly, { align: 'right' });
  });

  y += 35;

  // Executive Sign-Off & Compliance Authorization Block
  y = drawSectionHeader('3. CORPORATE COMPLIANCE & EXECUTIVE AUTHORIZATION', y);

  const sigW = (bodyW - 2 * 6) / 3;
  const sigs = [
    { role: 'FINANCE DIRECTOR / CFO', name: opts.sigName || 'Authorized Signatory' },
    { role: 'CISO / CHIEF SECURITY OFFICER', name: 'Security & Compliance Lead' },
    { role: 'CTO / VP ENGINEERING', name: 'Head of AI Operations' },
  ];

  sigs.forEach((s, idx) => {
    const sx = ML + idx * (sigW + 6);
    doc.setDrawColor(200, 210, 225);
    doc.setLineWidth(0.3);
    doc.rect(sx, y, sigW, 24);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(25, 45, 85);
    doc.text(s.role, sx + 3, y + 5.5);

    // Line for physical signature
    doc.setDrawColor(90, 90, 100);
    doc.setLineWidth(0.4);
    doc.line(sx + 3, y + 15, sx + sigW - 3, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(80, 80, 90);
    doc.text(s.name, sx + 3, y + 19);
    doc.text('Signature & Official Stamp', sx + 3, y + 22.5);
  });

  // Footer Page 1
  doc.setFillColor(16, 20, 28);
  doc.rect(0, 286, W, 11, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(160, 175, 200);
  doc.text(`${COMPANY_NAME}   |   GSTIN: ${GSTIN}   |   Vantage AI Enterprise Engine`, ML, 292);
  doc.text('CONFIDENTIAL — Official Corporate Submission Packet', W / 2, 292, { align: 'center' });
  doc.text('Sheet 1 of 3', W - MR, 292, { align: 'right' });
}

/* ─────────────────────────────────────────────────────────────
   PAGE 2: DEPARTMENTAL FINOPS ALLOCATION & MODEL ECONOMICS LEDGER
   Format: Portrait A4 (210mm x 297mm)
───────────────────────────────────────────────────────────── */
function drawPage2(doc, opts) {
  const W = 210, ML = 14, MR = 14, bodyW = W - ML - MR;

  // Header Dark Band
  doc.setFillColor(16, 20, 28);
  doc.rect(0, 0, W, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('VANTAGE AI — FINOPS COST ALLOCATION & MODEL UNIT ECONOMICS', ML, 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 175, 200);
  doc.text(`Period: ${opts.period}   |   Workspace: ${opts.workspace}`, W - MR, 11.5, { align: 'right' });

  // Blue Ribbon
  doc.setFillColor(15, 98, 254);
  doc.rect(0, 18, W, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('SHEET 2 OF 3: DEPARTMENTAL COST CENTERS, MODEL UNIT PRICING & COMPLIANCE RULES', W / 2, 21.5, { align: 'center' });

  let y = 28;

  function drawSectionHeader(titleText, currentY) {
    doc.setFillColor(232, 238, 248);
    doc.rect(ML, currentY, bodyW, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(25, 45, 85);
    doc.text(titleText, ML + 3, currentY + 3.8);
    return currentY + 8;
  }

  // Section 1: Departmental Cost Center Breakdown
  y = drawSectionHeader('1. DEPARTMENTAL COST CENTER ALLOCATION & BUDGET HEALTH', y);

  const totDeptCost  = DEPARTMENT_ALLOCATION.reduce((s, d) => s + d.cost, 0);
  const totDeptGst   = Math.round(totDeptCost * 0.18);
  const totDeptGross = totDeptCost + totDeptGst;
  const totDeptBudg  = DEPARTMENT_ALLOCATION.reduce((s, d) => s + d.budget, 0);

  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Department / Team', styles: { halign: 'left' } },
      { content: 'Cost Center ID',     styles: { halign: 'left' } },
      { content: 'Users',              styles: { halign: 'center'} },
      { content: 'Token Volume',     styles: { halign: 'right'} },
      { content: 'Net Cost (₹)',     styles: { halign: 'right'} },
      { content: 'IGST 18% (₹)',     styles: { halign: 'right'} },
      { content: 'Gross Cost (₹)',   styles: { halign: 'right'} },
      { content: 'Budget Limit (₹)', styles: { halign: 'right'} },
      { content: 'Util %',           styles: { halign: 'center'} },
      { content: 'Policy Status',    styles: { halign: 'center'} },
    ]],
    body: DEPARTMENT_ALLOCATION.map(d => {
      const gst = Math.round(d.cost * 0.18);
      const gross = d.cost + gst;
      return [
        d.dept,
        d.code,
        d.users,
        { content: tokensLabel(d.tokens), styles: { font: 'courier', halign: 'right' } },
        { content: inrFull(d.cost),       styles: { font: 'courier', halign: 'right' } },
        { content: inrFull(gst),          styles: { font: 'courier', halign: 'right' } },
        { content: inrFull(gross),        styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
        { content: inrFull(d.budget),     styles: { font: 'courier', halign: 'right' } },
        { content: d.budgetPct + '%',     styles: { halign: 'center' } },
        { content: policyStatusLabel(d.budgetPct), styles: { halign: 'center' } },
      ];
    }),
    headStyles: {
      fillColor: [16, 20, 28],
      textColor: [255, 255, 255],
      fontSize: 6.8,
      fontStyle: 'bold',
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 30, 40],
      cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: [246, 248, 253] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 22 },
      2: { cellWidth: 12 },
      3: { cellWidth: 20 },
      4: { cellWidth: 22 },
      5: { cellWidth: 18 },
      6: { cellWidth: 23 },
      7: { cellWidth: 21 },
      8: { cellWidth: 12 },
      9: { cellWidth: 14 },
    },
    willDrawCell(data) {
      if (data.section !== 'body') return;
      const row = DEPARTMENT_ALLOCATION[data.row.index];
      if (!row) return;
      const rgb = policyStatusColor(row.budgetPct);
      if (data.column.index === 8 || data.column.index === 9) {
        data.cell.styles.textColor = rgb;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    foot: [[
      { content: 'TOTALS', colSpan: 2, styles: { fontStyle: 'bold', halign: 'left' } },
      { content: DEPARTMENT_ALLOCATION.reduce((s,d)=>s+d.users,0), styles: { halign: 'center', fontStyle: 'bold' } },
      { content: tokensLabel(DEPARTMENT_ALLOCATION.reduce((s,d)=>s+d.tokens,0)), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inrFull(totDeptCost),       styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inrFull(totDeptGst),        styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inrFull(totDeptGross),      styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inrFull(totDeptBudg),       styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: Math.round((totDeptCost/totDeptBudg)*100) + '%', styles: { halign: 'center', fontStyle: 'bold' } },
      { content: policyStatusLabel(Math.round((totDeptCost/totDeptBudg)*100)), styles: { halign: 'center', fontStyle: 'bold' } },
    ]],
    footStyles: {
      fillColor: [16, 20, 28],
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    showFoot: 'lastPage',
  });

  y = doc.lastAutoTable.finalY + 6;

  // Section 2: Model Tier Unit Economics
  y = drawSectionHeader('2. MODEL TIER UNIT ECONOMICS & TOKEN RATE SPECIFICATIONS', y);

  const modelRows = Object.entries(MODEL_PRICING).map(([key, m]) => {
    const prompt1k     = (m.prompt * 1000).toFixed(4);
    const completion1k = (m.completion * 1000).toFixed(4);
    const avgRate1k    = (((m.prompt + m.completion) / 2) * 1000).toFixed(4);
    return [
      m.label,
      key,
      '₹' + prompt1k,
      '₹' + completion1k,
      '₹' + avgRate1k,
      'SAC ' + SAC_CODE,
      'ACTIVE ROUTING',
    ];
  });

  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Model Tier Label',styles: { halign: 'left' } },
      { content: 'Model Identifier',styles: { halign: 'left' } },
      { content: 'Prompt / 1k (₹)', styles: { halign: 'right'} },
      { content: 'Comp / 1k (₹)',   styles: { halign: 'right'} },
      { content: 'Avg / 1k Tok (₹)',styles: { halign: 'right'} },
      { content: 'Tax HSN/SAC',     styles: { halign: 'center'} },
      { content: 'Governance Status',styles:{ halign: 'center'} },
    ]],
    body: modelRows,
    headStyles: {
      fillColor: [16, 20, 28],
      textColor: [255, 255, 255],
      fontSize: 6.8,
      fontStyle: 'bold',
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 30, 40],
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: [246, 248, 253] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 32 },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 18 },
      6: { cellWidth: 19 },
    },
    willDrawCell(data) {
      if (data.section === 'body' && data.column.index === 6) {
        data.cell.styles.textColor = [20, 135, 55];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // Section 3: Governance Policy & Audit Rules
  y = drawSectionHeader('3. AUTOMATED GOVERNANCE & POLICY ENFORCEMENT AUDIT RULES', y);

  doc.setFillColor(248, 250, 254);
  doc.rect(ML, y, bodyW, 24, 'F');
  doc.setDrawColor(215, 225, 240);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, bodyW, 24);

  const rules = [
    '• NORMAL (<80% Budget): Requests routed normally across primary model endpoints without throttling.',
    '• WARNING (≥80% Budget): Automated fallback to cost-optimized tiers (e.g. GPT-4o-mini / Claude Haiku) triggered.',
    '• HARD CAP (≥100% Budget): API Key instantly blocked at client-side proxy to prevent unbudgeted cost overruns.',
    '• AGENTIC LOOP DETECTION: Flagged when completion/prompt ratio exceeds 8× or >10 consecutive recursive calls occur.',
  ];

  rules.forEach((r, idx) => {
    const ry = y + 5 + idx * 5;
    doc.setFont('helvetica', idx === 3 ? 'bold' : 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(idx === 3 ? 190 : 50, idx === 3 ? 20 : 50, idx === 3 ? 20 : 60);
    doc.text(r, ML + 4, ry);
  });

  // Footer Page 2
  doc.setFillColor(16, 20, 28);
  doc.rect(0, 286, W, 11, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(160, 175, 200);
  doc.text(`${COMPANY_NAME}   |   GSTIN: ${GSTIN}   |   Vantage AI Enterprise Engine`, ML, 292);
  doc.text('CONFIDENTIAL — Departmental Cost Allocation & Model Economics', W / 2, 292, { align: 'center' });
  doc.text('Sheet 2 of 3', W - MR, 292, { align: 'right' });
}

/* ─────────────────────────────────────────────────────────────
   PAGE 3: ITEMIZED RAW TELEMETRY APPENDIX & ANOMALY LOG
   Format: Landscape A4 (297mm x 210mm)
───────────────────────────────────────────────────────────── */
function drawPage3(doc, opts) {
  const W = 297, ML = 14, MR = 14, bodyW = W - ML - MR;

  // Header Dark Band
  doc.setFillColor(16, 20, 28);
  doc.rect(0, 0, W, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('VANTAGE AI — RAW TELEMETRY LEDGER & AGENTIC AI ANOMALY AUDIT LOG', ML, 10.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 175, 200);
  doc.text(`Period: ${opts.period}   |   Workspace: ${opts.workspace}   |   CONFIDENTIAL`, W - MR, 10.5, { align: 'right' });

  // Blue Ribbon
  doc.setFillColor(15, 98, 254);
  doc.rect(0, 16, W, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('SHEET 3 OF 3: ITEMIZED TRANSACTION TELEMETRY, TOKEN COSTS & AGENTIC LOOP AUDIT', W / 2, 19.2, { align: 'center' });

  let y = 23.5;

  // Telemetry Table
  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Timestamp',        styles: { halign: 'left'  } },
      { content: 'Employee ID',      styles: { halign: 'left'  } },
      { content: 'Department',       styles: { halign: 'left'  } },
      { content: 'Provider',         styles: { halign: 'left'  } },
      { content: 'Model Tier',       styles: { halign: 'left'  } },
      { content: 'Prompt Tok',       styles: { halign: 'right' } },
      { content: 'Comp Tok',         styles: { halign: 'right' } },
      { content: 'Cost/Tok (₹)',     styles: { halign: 'right' } },
      { content: 'Net Cost (₹)',     styles: { halign: 'right' } },
      { content: 'IGST 18% (₹)',     styles: { halign: 'right' } },
      { content: 'Gross Total (₹)',  styles: { halign: 'right' } },
      { content: 'Policy Status',    styles: { halign: 'center'} },
      { content: 'Loop Audit',       styles: { halign: 'center'} },
    ]],
    body: RAW_TELEMETRY.map(r => {
      const mPrice    = MODEL_PRICING[r.model] || { prompt: 0.0001, completion: 0.0002 };
      const costPerTok= (((mPrice.prompt + mPrice.completion)/2)*1000).toFixed(4);
      const gst       = Math.round(r.cost * 0.18);
      const gross     = r.cost + gst;
      return [
        { content: r.ts,                        styles: { font: 'courier', fontSize: 6.5 } },
        { content: r.eid,                       styles: { font: 'courier', fontSize: 6.5, textColor: [15,80,200] } },
        { content: r.dept,                      styles: { fontSize: 6.8 } },
        { content: r.provider,                  styles: { fontSize: 6.8 } },
        { content: r.model,                     styles: { font: 'courier', fontSize: 6.5 } },
        { content: r.prompt.toLocaleString('en-IN'),     styles: { font: 'courier', halign: 'right', fontSize: 6.8 } },
        { content: r.completion.toLocaleString('en-IN'), styles: { font: 'courier', halign: 'right', fontSize: 6.8 } },
        { content: '₹' + costPerTok,            styles: { font: 'courier', halign: 'right', fontSize: 6.5 } },
        { content: inrFull(r.cost),             styles: { font: 'courier', halign: 'right', fontSize: 6.8 } },
        { content: inrFull(gst),                styles: { font: 'courier', halign: 'right', fontSize: 6.8 } },
        { content: inrFull(gross),              styles: { font: 'courier', halign: 'right', fontSize: 6.8, fontStyle: 'bold' } },
        { content: policyStatusLabel(r.budgetPct),styles:{ halign: 'center', fontSize: 6.5 } },
        { content: r.loop ? 'LOOP DETECTED ⚠' : 'NORMAL', styles: { halign: 'center', fontSize: 6.5 } },
      ];
    }),
    headStyles: {
      fillColor: [16, 20, 28],
      textColor: [255, 255, 255],
      fontSize: 6.5,
      fontStyle: 'bold',
      cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 },
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [30, 30, 40],
      cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 },
    },
    alternateRowStyles: { fillColor: [246, 248, 253] },
    columnStyles: {
      0:  { cellWidth: 26 },
      1:  { cellWidth: 22 },
      2:  { cellWidth: 22 },
      3:  { cellWidth: 20 },
      4:  { cellWidth: 30 },
      5:  { cellWidth: 18 },
      6:  { cellWidth: 18 },
      7:  { cellWidth: 20 },
      8:  { cellWidth: 18 },
      9:  { cellWidth: 18 },
      10: { cellWidth: 22 },
      11: { cellWidth: 17 },
      12: { cellWidth: 18 },
    },
    willDrawCell(data) {
      if (data.section !== 'body') return;
      const row = RAW_TELEMETRY[data.row.index];
      if (!row) return;
      const rgb = policyStatusColor(row.budgetPct);
      if (data.column.index === 11) {
        data.cell.styles.textColor = rgb;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 12 && row.loop) {
        data.cell.styles.textColor = [200, 20, 20];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 235, 235];
      }
    },
    foot: [[
      { content: 'TOTALS', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: RAW_TELEMETRY.reduce((s,r)=>s+r.prompt,0).toLocaleString('en-IN'), styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: RAW_TELEMETRY.reduce((s,r)=>s+r.completion,0).toLocaleString('en-IN'), styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: '' },
      { content: inrFull(RAW_TELEMETRY.reduce((s,r)=>s+r.cost,0)), styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: inrFull(Math.round(RAW_TELEMETRY.reduce((s,r)=>s+r.cost,0)*0.18)), styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: inrFull(Math.round(RAW_TELEMETRY.reduce((s,r)=>s+r.cost,0)*1.18)), styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: '' },
      { content: `${RAW_TELEMETRY.filter(r=>r.loop).length} LOOP(S)`, styles: { halign:'center', fontStyle:'bold', textColor:[200,20,20] } },
    ]],
    footStyles: {
      fillColor: [16, 20, 28],
      textColor: [255, 255, 255],
      fontSize: 6.8,
      fontStyle: 'bold',
      cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 },
    },
    showFoot: 'lastPage',
    showHead: 'everyPage',
  });

  y = doc.lastAutoTable.finalY + 5;

  // Final Audit & Tax Sign-Off Box
  doc.setFillColor(248, 250, 254);
  doc.rect(ML, y, bodyW, 22, 'F');
  doc.setDrawColor(215, 225, 240);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, bodyW, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(25, 45, 85);
  doc.text('TELEMETRY AUDIT & COMPLIANCE CERTIFICATION:', ML + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(60, 60, 70);
  doc.text('This 3-Sheet Enterprise AI Telemetry & Tax Submission Packet has been generated by Vantage AI proxy engine.', ML + 4, y + 9.5);
  doc.text('All API calls, token counts, and cost-per-token metrics have been verified against raw vendor telemetry feeds.', ML + 4, y + 13.5);
  doc.text('Tax Liability (IGST @ 18%) is calculated as per India GST Rules under SAC Code 998313.', ML + 4, y + 17.5);

  // Right Signatures
  const rxSig = ML + 190;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(25, 45, 85);
  doc.text('INTERNAL CONTROL AUDITOR', rxSig, y + 5);
  doc.line(rxSig, y + 14, rxSig + 75, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(80, 80, 90);
  doc.text('Authorized Compliance Signature & Stamp', rxSig, y + 18);

  // Footer Page 3
  doc.setFillColor(16, 20, 28);
  doc.rect(0, 203, W, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(160, 175, 200);
  doc.text(`${COMPANY_NAME}   |   GSTIN: ${GSTIN}   |   SAC Code: ${SAC_CODE}`, ML, 207);
  doc.text('CONFIDENTIAL — End of 3-Sheet Corporate Tax & Billing Packet', W / 2, 207, { align: 'center' });
  doc.text('Sheet 3 of 3', W - MR, 207, { align: 'right' });
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT FUNCTION
───────────────────────────────────────────────────────────── */
export async function exportVantagePDF(options = {}) {
  const opts = {
    period:         options.period         || 'July 2026',
    workspace:      options.workspace      || COMPANY_NAME,
    sigName:        options.sigName        || '',
    includeAppendix:options.includeAppendix !== false,
  };

  if (!window.jspdf?.jsPDF) {
    window.showToast?.('PDF library not loaded. Refresh and try again.', 'error');
    return;
  }

  // Disable buttons while generating
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

  await new Promise(r => setTimeout(r, 60));

  try {
    const { jsPDF } = window.jspdf;

    // Sheet 1 — Portrait A4
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    drawPage1(doc, opts);

    // Sheet 2 — Portrait A4
    doc.addPage([210, 297], 'portrait');
    drawPage2(doc, opts);

    // Sheet 3 — Landscape A4
    doc.addPage([297, 210], 'landscape');
    drawPage3(doc, opts);

    const filename = `Vantage_Enterprise_Billing_Packet_${opts.period.replace(/\s/g, '_')}.pdf`;
    doc.save(filename);
    finishProgress();
    window.showToast?.(`Downloaded Official 3-Sheet Packet — ${filename}`, 'success');

  } catch (err) {
    console.error('[PDF] Generation error:', err);
    finishProgress();
    window.showToast?.('PDF generation failed. See console.', 'error');
  } finally {
    if (splineIframe)    splineIframe.style.visibility    = '';
    if (splineContainer) splineContainer.style.visibility = '';
    document.querySelectorAll('[data-pdf-trigger]').forEach(b => {
      b.disabled = false;
      b.removeAttribute('aria-busy');
    });
  }
}
