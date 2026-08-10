/**
 * Vantage AI — Corporate Enterprise Billing Packet
 * 3-Sheet A4 PDF: Tax Invoice + FinOps Ledger + Raw Telemetry Appendix
 *
 * Color palette modeled after real SAP / Oracle / AWS India corporate billing
 * documents — deep navy headers, clean white pages, subtle grid lines.
 *
 * Uses jsPDF 2.5 + jspdf-autotable 3.8 (loaded via CDN before this module)
 */

/* ═══════════════════════════════════════════════════════════
   CORPORATE IDENTITY & TAX CONSTANTS
═══════════════════════════════════════════════════════════ */
const CO_NAME   = 'TechCorp India Private Limited';
const CO_ADDR1  = 'Unit 4B, 4th Floor, Prestige Tech Park';
const CO_ADDR2  = 'Outer Ring Road, Bengaluru – 560 103, Karnataka';
const CO_GSTIN  = '27AABCT1234N1Z5';
const CO_PAN    = 'AABCT1234N';
const CO_CIN    = 'U72900KA2018PTC112345';
const CO_EMAIL  = 'finance@techcorp.in';
const CO_TEL    = '+91 80 4123 5678';

const INV_NO    = 'VTG-2026-07-INV-0041';
const INV_DATE  = '31 July 2026';
const DUE_DATE  = '15 August 2026';
const SAC_CODE  = '998313';
const GST_RATE  = 0.18;
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;

/* Color tokens — match real corporate billing documents */
const C = {
  navy:    [10,  31,  68],    // Header background — deep navy
  navyMid: [20,  52,  105],   // Sub-header, section strips
  blue:    [15,  98,  254],   // Accent / brand
  white:   [255, 255, 255],
  black:   [15,  15,  20],
  ink:     [30,  35,  45],    // Body text
  muted:   [95,  100, 115],   // Secondary text
  border:  [210, 215, 225],   // Table borders
  rowEven: [247, 249, 253],   // Alternate row fill
  rowHead: [232, 238, 250],   // Column header background
  green:   [20,  115, 55],    // Normal / OK
  amber:   [155, 80,  0],     // Warning
  red:     [185, 20,  20],    // Hard cap / critical
  greenBg: [230, 250, 237],
  amberBg: [255, 243, 215],
  redBg:   [255, 232, 232],
};

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const MODEL_PRICE = {
  'gpt-4o':             { prompt: 0.000416, completion: 0.001248 },
  'gpt-4-turbo':        { prompt: 0.000832, completion: 0.002496 },
  'gpt-3.5-turbo':      { prompt: 0.0000416,completion: 0.0000624},
  'claude-3-5-sonnet':  { prompt: 0.000249, completion: 0.001247 },
  'claude-3-haiku':     { prompt: 0.0000208,completion: 0.000104 },
  'gemini-1.5-pro':     { prompt: 0.000104, completion: 0.000312 },
  'gemini-1.5-flash':   { prompt: 0.0000104,completion: 0.0000312},
  'runway-gen3':        { prompt: 0.000050, completion: 0.000200 },
  'synthesia-v2':       { prompt: 0.000150, completion: 0.000450 },
  'copilot-chat':       { prompt: 0.000104, completion: 0.000208 },
  'eleven-turbo-v2':    { prompt: 0.000080, completion: 0.000240 },
};

const PROVIDERS = [
  { name:'OpenAI',           cat:'Text & Code API',   tokens:9820000, net:112430, budget:200000, pct:89  },
  { name:'Anthropic Claude', cat:'Text & Code API',   tokens:3410000, net:54180,  budget:80000,  pct:72  },
  { name:'Google Gemini',    cat:'Text & Code API',   tokens:2980000, net:38290,  budget:63000,  pct:61  },
  { name:'Synthesia',        cat:'Video Generation',  tokens:1120000, net:35280,  budget:37500,  pct:94  },
  { name:'GitHub Copilot',   cat:'Code Assistance',   tokens:2650000, net:26600,  budget:25000,  pct:106 },
  { name:'Runway ML',        cat:'Video Generation',  tokens:880000,  net:26160,  budget:32000,  pct:82  },
  { name:'Meta Llama',       cat:'Text & Code API',   tokens:1440000, net:16370,  budget:30000,  pct:55  },
  { name:'ElevenLabs',       cat:'Audio & Speech',    tokens:510000,  net:11440,  budget:24000,  pct:48  },
];

const DEPTS = [
  { name:'Engineering',      cc:'CC-ENG-101', heads:11, tokens:14210000, net:161820, budget:180000, pct:90 },
  { name:'Marketing',        cc:'CC-MKT-202', heads:4,  tokens:6600000,  net:60540,  budget:80000,  pct:76 },
  { name:'Data & Analytics', cc:'CC-DAT-303', heads:3,  tokens:4480000,  net:41200,  budget:65000,  pct:63 },
  { name:'Video Production', cc:'CC-VID-404', heads:2,  tokens:2680000,  net:38333,  budget:45000,  pct:85 },
  { name:'Operations',       cc:'CC-OPS-505', heads:2,  tokens:2200000,  net:18860,  budget:30000,  pct:63 },
];

const TELEM = [
  { ts:'2026-07-31 23:58', eid:'EMP-EN-001', dept:'Engineering',  prov:'OpenAI',     model:'gpt-4o',            pt:12400, ct:3820,  net:7298,  pct:89,  loop:false },
  { ts:'2026-07-31 22:41', eid:'EMP-EN-002', dept:'Engineering',  prov:'OpenAI',     model:'gpt-4-turbo',       pt:8200,  ct:1100,  net:9527,  pct:89,  loop:false },
  { ts:'2026-07-31 21:30', eid:'EMP-EN-011', dept:'Engineering',  prov:'OpenAI',     model:'gpt-4o',            pt:3800,  ct:31200, net:41590, pct:106, loop:true  },
  { ts:'2026-07-31 20:15', eid:'EMP-VD-003', dept:'Video Prod.',  prov:'Runway ML',  model:'runway-gen3',       pt:2100,  ct:890,   net:4830,  pct:85,  loop:false },
  { ts:'2026-07-31 19:54', eid:'EMP-MK-007', dept:'Marketing',    prov:'OpenAI',     model:'gpt-4o',            pt:5400,  ct:1620,  net:3244,  pct:76,  loop:false },
  { ts:'2026-07-31 18:30', eid:'EMP-PD-004', dept:'Engineering',  prov:'Synthesia',  model:'synthesia-v2',      pt:900,   ct:3600,  net:8190,  pct:90,  loop:false },
  { ts:'2026-07-31 17:12', eid:'EMP-EN-005', dept:'Engineering',  prov:'Anthropic',  model:'claude-3-5-sonnet', pt:11200, ct:2840,  net:6324,  pct:90,  loop:false },
  { ts:'2026-07-31 16:45', eid:'EMP-DA-002', dept:'Data & Analy.',prov:'Google',     model:'gemini-1.5-pro',    pt:18600, ct:4200,  net:3243,  pct:63,  loop:false },
  { ts:'2026-07-31 15:30', eid:'EMP-OP-001', dept:'Operations',   prov:'OpenAI',     model:'gpt-3.5-turbo',     pt:22000, ct:5800,  net:1279,  pct:63,  loop:false },
  { ts:'2026-07-31 14:10', eid:'EMP-EN-008', dept:'Engineering',  prov:'GitHub',     model:'copilot-chat',      pt:9800,  ct:2200,  net:2185,  pct:106, loop:false },
  { ts:'2026-07-31 13:55', eid:'EMP-MK-003', dept:'Marketing',    prov:'ElevenLabs', model:'eleven-turbo-v2',   pt:1200,  ct:4800,  net:2810,  pct:76,  loop:false },
  { ts:'2026-07-30 22:30', eid:'EMP-VD-001', dept:'Video Prod.',  prov:'Runway ML',  model:'runway-gen3',       pt:1800,  ct:720,   net:4153,  pct:85,  loop:false },
  { ts:'2026-07-30 20:15', eid:'EMP-EN-003', dept:'Engineering',  prov:'OpenAI',     model:'gpt-4o',            pt:6200,  ct:1880,  net:4889,  pct:90,  loop:false },
  { ts:'2026-07-30 18:40', eid:'EMP-PD-002', dept:'Engineering',  prov:'Anthropic',  model:'claude-3-haiku',    pt:14400, ct:3600,  net:677,   pct:90,  loop:false },
  { ts:'2026-07-30 16:20', eid:'EMP-DA-005', dept:'Data & Analy.',prov:'Google',     model:'gemini-1.5-flash',  pt:42000, ct:8400,  net:877,   pct:63,  loop:false },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const r2 = n => Math.round(n * 100) / 100;
function inr(n)  { return '\u20b9' + Math.round(n).toLocaleString('en-IN'); }
function inrL(n) {
  if (n >= 10000000) return '\u20b9' + (n/10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '\u20b9' + (n/100000).toFixed(2) + ' L';
  return inr(n);
}
function tokK(t) {
  if (t >= 1000000) return (t/1000000).toFixed(2)+'M';
  if (t >= 1000)    return (t/1000).toFixed(1)+'K';
  return String(t);
}
function polLabel(pct) {
  if (pct >= 100) return 'HARD CAP';
  if (pct >= 80)  return 'WARNING';
  return 'NORMAL';
}
function polRgb(pct) {
  if (pct >= 100) return C.red;
  if (pct >= 80)  return C.amber;
  return C.green;
}

/* shared autotable head/body styles */
const HEAD_STYLE = {
  fillColor: C.navyMid,
  textColor: C.white,
  fontStyle: 'bold',
  fontSize: 7,
  cellPadding: { top:3, bottom:3, left:3, right:3 },
  lineColor: C.navyMid,
  lineWidth: 0,
};
const BODY_STYLE = {
  fontSize: 7.2,
  textColor: C.ink,
  cellPadding: { top:2.5, bottom:2.5, left:3, right:3 },
  lineColor: C.border,
  lineWidth: 0.2,
};
const FOOT_STYLE = {
  fillColor: C.navy,
  textColor: C.white,
  fontStyle: 'bold',
  fontSize: 7.2,
  cellPadding: { top:3, bottom:3, left:3, right:3 },
  lineWidth: 0,
};
const ALT_ROW = { fillColor: C.rowEven };

/* ═══════════════════════════════════════════════════════════
   SHEET 1 — OFFICIAL TAX INVOICE & EXECUTIVE SUMMARY
   Portrait A4 | 210 × 297 mm
═══════════════════════════════════════════════════════════ */
function buildSheet1(doc, opts) {
  const W=210, ML=15, MR=15, BW=W-ML-MR;

  /* ── HEADER: Company Identity Block ───────────────────────────────── */
  // Navy header band
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, W, 28, 'F');

  // Left brand mark — simple rectangle badge
  doc.setFillColor(...C.blue);
  doc.rect(ML, 6, 1.5, 16, 'F');

  // Company name & address
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...C.white);
  doc.text(CO_NAME, ML+5, 12.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(185, 200, 230);
  doc.text(`${CO_ADDR1}, ${CO_ADDR2}`, ML+5, 18);
  doc.text(`GSTIN: ${CO_GSTIN}   |   PAN: ${CO_PAN}   |   CIN: ${CO_CIN}   |   SAC: ${SAC_CODE}`, ML+5, 23);

  // Right: Invoice Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text('TAX INVOICE', W-MR, 12, { align:'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(185, 200, 230);
  doc.text(`Invoice No.: ${INV_NO}`, W-MR, 18, { align:'right' });
  doc.text(`Invoice Date: ${INV_DATE}   |   Due: ${DUE_DATE}`, W-MR, 23, { align:'right' });

  let y = 32;

  /* ── "BILLED TO" + "TAX DETAILS" horizontal split ─────────────────── */
  const colW = (BW-5)/2;

  // Box 1: Billed To
  doc.setFillColor(...C.rowEven);
  doc.rect(ML, y, colW, 28, 'F');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, colW, 28);

  // Label strip
  doc.setFillColor(...C.navyMid);
  doc.rect(ML, y, colW, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.white);
  doc.text('BILLED TO', ML+3, y+3.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.ink);
  doc.text(opts.workspace, ML+3, y+10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(`GSTIN: ${CO_GSTIN}`, ML+3, y+15.5);
  doc.text(`PAN: ${CO_PAN}`, ML+3, y+20);
  doc.text(`${CO_ADDR1}`, ML+3, y+24.5);

  // Box 2: Tax & Payment Reference
  const rx = ML+colW+5;
  doc.setFillColor(...C.rowEven);
  doc.rect(rx, y, colW, 28, 'F');
  doc.setDrawColor(...C.border);
  doc.rect(rx, y, colW, 28);

  doc.setFillColor(...C.navyMid);
  doc.rect(rx, y, colW, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.white);
  doc.text('SERVICE & TAX REFERENCE', rx+3, y+3.5);

  const taxMeta = [
    ['SAC / HSN Code',           SAC_CODE + ' — IT Software & API Services'],
    ['Nature of Supply',         'Information Technology Enabled Services (ITES)'],
    ['Tax Type',                 'IGST @ 18% (Interstate Supply)'],
    ['Reverse Charge',           'Not Applicable'],
    ['Billing Period',           opts.period],
  ];
  taxMeta.forEach(([k,v],i) => {
    const ly = y + 9 + i * 3.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(k + ':', rx+3, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.ink);
    doc.text(v, rx+colW-3, ly, { align:'right' });
  });

  y += 32;

  /* ── KPI STRIP ─────────────────────────────────────────────────────── */
  const totalNet    = PROVIDERS.reduce((s,p)=>s+p.net, 0);
  const totalCGST   = Math.round(totalNet * CGST_RATE);
  const totalSGST   = Math.round(totalNet * SGST_RATE);
  const totalGST    = Math.round(totalNet * GST_RATE);
  const totalGross  = totalNet + totalGST;
  const totalBudget = PROVIDERS.reduce((s,p)=>s+p.budget, 0);
  const budgetPct   = Math.round((totalNet/totalBudget)*100);
  const totalTok    = PROVIDERS.reduce((s,p)=>s+p.tokens, 0);

  const kpis = [
    { label:'TAXABLE VALUE',    value: inrL(totalNet),   note:'Net of GST',           accent: C.navyMid },
    { label:'CGST (9%)',        value: inrL(totalCGST),  note:'Central Tax',          accent: [60,90,160] },
    { label:'SGST (9%)',        value: inrL(totalSGST),  note:'State Tax',            accent: [60,90,160] },
    { label:'TOTAL PAYABLE',    value: inrL(totalGross), note:'Gross Inc. Tax',       accent: C.navy },
    { label:'BUDGET HEALTH',    value: budgetPct+'%',    note: polLabel(budgetPct),   accent: polRgb(budgetPct) },
  ];

  const kW = (BW - 4*2) / 5;
  kpis.forEach((k,i) => {
    const cx = ML + i*(kW+2);
    // Card
    doc.setFillColor(...C.white);
    doc.rect(cx, y, kW, 18, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.rect(cx, y, kW, 18);
    // Top accent bar
    doc.setFillColor(...k.accent);
    doc.rect(cx, y, kW, 2, 'F');
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...C.muted);
    doc.text(k.label, cx+kW/2, y+6.5, { align:'center' });
    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...k.accent);
    doc.text(k.value, cx+kW/2, y+12.5, { align:'center' });
    // Note
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...k.accent);
    doc.text(k.note, cx+kW/2, y+16.5, { align:'center' });
  });

  y += 22;

  /* ── SECTION HEADER ─────────────────────────────────────────────────── */
  function sh(label, currentY) {
    doc.setFillColor(...C.rowHead);
    doc.rect(ML, currentY, BW, 5.5, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.rect(ML, currentY, BW, 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.navyMid);
    doc.text(label, ML+3, currentY+3.8);
    return currentY + 7;
  }

  /* ── TABLE 1: Provider Cost & Tax Breakdown ─────────────────────────── */
  y = sh('AI PROVIDER COST & TAX BREAKDOWN', y);

  doc.autoTable({
    startY: y,
    margin: { left:ML, right:MR },
    head: [[
      {content:'Provider Name',  styles:{halign:'left'}},
      {content:'Service Type',   styles:{halign:'left'}},
      {content:'Token Volume',   styles:{halign:'right'}},
      {content:'Taxable Value',  styles:{halign:'right'}},
      {content:'CGST 9% (₹)',    styles:{halign:'right'}},
      {content:'SGST 9% (₹)',    styles:{halign:'right'}},
      {content:'Total Incl.Tax', styles:{halign:'right'}},
      {content:'Budget',         styles:{halign:'right'}},
      {content:'Util.',          styles:{halign:'center'}},
      {content:'Status',         styles:{halign:'center'}},
    ]],
    body: PROVIDERS.map(p => {
      const cgst = Math.round(p.net*CGST_RATE);
      const sgst = Math.round(p.net*SGST_RATE);
      return [
        {content:p.name,               styles:{fontStyle:'bold',textColor:C.ink}},
        {content:p.cat,                styles:{textColor:C.muted}},
        {content:tokK(p.tokens),       styles:{font:'courier',halign:'right'}},
        {content:inr(p.net),           styles:{font:'courier',halign:'right'}},
        {content:inr(cgst),            styles:{font:'courier',halign:'right'}},
        {content:inr(sgst),            styles:{font:'courier',halign:'right'}},
        {content:inr(p.net+cgst+sgst), styles:{font:'courier',halign:'right',fontStyle:'bold'}},
        {content:inr(p.budget),        styles:{font:'courier',halign:'right'}},
        {content:p.pct+'%',            styles:{halign:'center'}},
        {content:polLabel(p.pct),      styles:{halign:'center'}},
      ];
    }),
    headStyles:    HEAD_STYLE,
    bodyStyles:    BODY_STYLE,
    alternateRowStyles: ALT_ROW,
    columnStyles: {
      0:{cellWidth:26}, 1:{cellWidth:24},2:{cellWidth:18},
      3:{cellWidth:20}, 4:{cellWidth:16},5:{cellWidth:16},
      6:{cellWidth:23}, 7:{cellWidth:18},8:{cellWidth:12},9:{cellWidth:7},
    },
    willDrawCell(data) {
      if (data.section!=='body') return;
      const p = PROVIDERS[data.row.index]; if(!p) return;
      const rgb = polRgb(p.pct);
      if (data.column.index===8||data.column.index===9) {
        data.cell.styles.textColor  = rgb;
        data.cell.styles.fontStyle  = 'bold';
      }
    },
    foot:[[
      {content:'GRAND TOTALS',colSpan:2, styles:{halign:'left',fontStyle:'bold'}},
      {content:tokK(totalTok),          styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(totalNet),           styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(totalCGST),          styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(totalSGST),          styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(totalGross),         styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(totalBudget),        styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:budgetPct+'%',           styles:{halign:'center',fontStyle:'bold',textColor:polRgb(budgetPct)}},
      {content:polLabel(budgetPct),     styles:{halign:'center',fontStyle:'bold',textColor:polRgb(budgetPct)}},
    ]],
    footStyles: FOOT_STYLE,
    showFoot:'lastPage',
  });

  y = doc.lastAutoTable.finalY + 5;

  /* ── TAX SUMMARY + BANK DETAILS SPLIT ─────────────────────────────── */
  y = sh('TAX SUMMARY & PAYMENT DETAILS', y);
  const boxH = 32, col2W = (BW-5)/2;

  // Left: Amount in words + tax breakdown
  doc.setFillColor(...C.white);
  doc.rect(ML, y, col2W, boxH, 'F');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, col2W, boxH);

  const taxLines = [
    ['Sub Total (Taxable Value)', inr(totalNet)],
    ['CGST @ 9%', inr(totalCGST)],
    ['SGST @ 9%', inr(totalSGST)],
    ['IGST @ 18% (if interstate)', inr(totalGST)],
    ['Rounded Off', '—'],
    ['TOTAL AMOUNT PAYABLE', inr(totalGross)],
  ];
  taxLines.forEach(([k,v],i) => {
    const ly = y + 5 + i*4.5;
    const isTot = i===5;
    if (isTot) {
      doc.setFillColor(...C.navyMid);
      doc.rect(ML, ly-2.5, col2W, 6, 'F');
    }
    doc.setFont('helvetica', isTot ? 'bold' : 'normal');
    doc.setFontSize(7);
    doc.setTextColor(isTot ? 255 : 80, isTot ? 255 : 80, isTot ? 255 : 90);
    doc.text(k, ML+3, ly);
    doc.text(v, ML+col2W-3, ly, { align:'right' });
  });

  // Right: Bank / NEFT details
  const rx2 = ML+col2W+5;
  doc.setFillColor(...C.white);
  doc.rect(rx2, y, col2W, boxH, 'F');
  doc.setDrawColor(...C.border);
  doc.rect(rx2, y, col2W, boxH);

  const bankLines = [
    ['Account Name',    CO_NAME],
    ['Bank',            'HDFC Bank Ltd. — Corporate Branch'],
    ['Account No.',     '50200084729104'],
    ['IFSC Code',       'HDFC0000240'],
    ['Payment Terms',   'Net 15 Days from Invoice Date'],
    ['Contact Finance', CO_EMAIL + '   ' + CO_TEL],
  ];
  bankLines.forEach(([k,v],i) => {
    const ly = y + 5 + i*4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.muted);
    doc.text(k + ':', rx2+3, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.ink);
    doc.text(v, rx2+col2W-3, ly, { align:'right' });
  });

  y += boxH + 5;

  /* ── AUTHORIZATION SIGN-OFF ─────────────────────────────────────────── */
  y = sh('EXECUTIVE AUTHORIZATION & COMPLIANCE SIGN-OFF', y);

  const sigs = [
    { title:'FINANCE DIRECTOR / CFO',       name: opts.sigName || 'Authorized Signatory' },
    { title:'CISO / COMPLIANCE LEAD',        name: 'Security & Risk Officer' },
    { title:'CTO / HEAD OF ENGINEERING',     name: 'AI Operations Head' },
  ];
  const sigW = (BW - 2*5)/3;

  sigs.forEach((s,i) => {
    const sx = ML + i*(sigW+5);
    // Box
    doc.setFillColor(...C.white);
    doc.rect(sx, y, sigW, 22, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.rect(sx, y, sigW, 22);

    // Top label
    doc.setFillColor(...C.rowHead);
    doc.rect(sx, y, sigW, 4.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(...C.navyMid);
    doc.text(s.title, sx+sigW/2, y+3, { align:'center' });

    // Name
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(s.name, sx+3, y+10);

    // Signature line
    doc.setDrawColor(...C.muted);
    doc.setLineWidth(0.35);
    doc.line(sx+3, y+16, sx+sigW-3, y+16);

    // Date label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...C.muted);
    doc.text('Signature / Seal        Date: ____/____/________', sx+3, y+20.5);
  });

  /* ── PAGE FOOTER ────────────────────────────────────────────────────── */
  // Thin border line above footer
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, 284, W-MR, 284);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...C.muted);
  doc.text(`${CO_NAME}   |   GSTIN: ${CO_GSTIN}   |   ${CO_EMAIL}   |   ${CO_TEL}`, ML, 288);
  doc.text('This is a computer-generated invoice. No physical signature required unless specified above.', ML, 292);
  doc.setTextColor(...C.navyMid);
  doc.setFont('helvetica', 'bold');
  doc.text('Page 1 of 3', W-MR, 292, { align:'right' });
}

/* ═══════════════════════════════════════════════════════════
   SHEET 2 — DEPARTMENTAL FINOPS & MODEL RATE CARD
   Portrait A4 | 210 × 297 mm
═══════════════════════════════════════════════════════════ */
function buildSheet2(doc, opts) {
  const W=210, ML=15, MR=15, BW=W-ML-MR;

  /* ── HEADER ──────────────────────────────────────────────────────────── */
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, W, 18, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(ML, 4, 1.5, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.white);
  doc.text('DEPARTMENTAL FINOPS COST ALLOCATION  &  MODEL RATE CARD', ML+5, 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(185, 200, 230);
  doc.text(`${opts.workspace}   |   ${opts.period}   |   Invoice: ${INV_NO}`, W-MR, 10.5, { align:'right' });

  doc.setFillColor(...C.navyMid);
  doc.rect(0, 18, W, 4, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.white);
  doc.text('Sheet 2 of 3  —  Departmental Cost Centers, Token Economics & Automated Governance Policy', W/2, 21, { align:'center' });

  let y = 27;

  function sh(label, currentY) {
    doc.setFillColor(...C.rowHead);
    doc.rect(ML, currentY, BW, 5.5, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.rect(ML, currentY, BW, 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.navyMid);
    doc.text(label, ML+3, currentY+3.8);
    return currentY + 7;
  }

  /* ── TABLE 1: Departmental Allocation ───────────────────────────────── */
  y = sh('DEPARTMENTAL COST CENTER ALLOCATION', y);

  const totDN  = DEPTS.reduce((s,d)=>s+d.net,0);
  const totDB  = DEPTS.reduce((s,d)=>s+d.budget,0);
  const totDH  = DEPTS.reduce((s,d)=>s+d.heads,0);
  const totDT  = DEPTS.reduce((s,d)=>s+d.tokens,0);
  const totDPct= Math.round((totDN/totDB)*100);

  doc.autoTable({
    startY: y,
    margin: { left:ML, right:MR },
    head: [[
      {content:'Department',      styles:{halign:'left'}},
      {content:'Cost Center',     styles:{halign:'left'}},
      {content:'Users',           styles:{halign:'center'}},
      {content:'Token Vol.',      styles:{halign:'right'}},
      {content:'Net Cost (₹)',    styles:{halign:'right'}},
      {content:'CGST 9% (₹)',     styles:{halign:'right'}},
      {content:'SGST 9% (₹)',     styles:{halign:'right'}},
      {content:'Gross (₹)',       styles:{halign:'right'}},
      {content:'Budget (₹)',      styles:{halign:'right'}},
      {content:'Util.',           styles:{halign:'center'}},
      {content:'Status',          styles:{halign:'center'}},
    ]],
    body: DEPTS.map(d => {
      const cgst = Math.round(d.net*CGST_RATE);
      const sgst = Math.round(d.net*SGST_RATE);
      return [
        {content:d.name,       styles:{fontStyle:'bold'}},
        {content:d.cc,         styles:{font:'courier',fontSize:6.5,textColor:C.muted}},
        {content:d.heads,      styles:{halign:'center'}},
        {content:tokK(d.tokens),styles:{font:'courier',halign:'right'}},
        {content:inr(d.net),   styles:{font:'courier',halign:'right'}},
        {content:inr(cgst),    styles:{font:'courier',halign:'right'}},
        {content:inr(sgst),    styles:{font:'courier',halign:'right'}},
        {content:inr(d.net+cgst+sgst),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
        {content:inr(d.budget),styles:{font:'courier',halign:'right'}},
        {content:d.pct+'%',    styles:{halign:'center'}},
        {content:polLabel(d.pct),styles:{halign:'center'}},
      ];
    }),
    headStyles: HEAD_STYLE,
    bodyStyles: BODY_STYLE,
    alternateRowStyles: ALT_ROW,
    columnStyles:{
      0:{cellWidth:28},1:{cellWidth:22},2:{cellWidth:11},
      3:{cellWidth:18},4:{cellWidth:20},5:{cellWidth:16},
      6:{cellWidth:16},7:{cellWidth:21},8:{cellWidth:18},
      9:{cellWidth:11},10:{cellWidth:9},
    },
    willDrawCell(data) {
      if(data.section!=='body') return;
      const d = DEPTS[data.row.index]; if(!d) return;
      const rgb = polRgb(d.pct);
      if(data.column.index===9||data.column.index===10){
        data.cell.styles.textColor = rgb;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    foot:[[
      {content:'TOTALS',colSpan:2,styles:{fontStyle:'bold',halign:'left'}},
      {content:totDH,  styles:{halign:'center',fontStyle:'bold'}},
      {content:tokK(totDT),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(totDN),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(Math.round(totDN*CGST_RATE)),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(Math.round(totDN*SGST_RATE)),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(Math.round(totDN*1.18)),     styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(totDB), styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:totDPct+'%',styles:{halign:'center',fontStyle:'bold',textColor:polRgb(totDPct)}},
      {content:polLabel(totDPct),styles:{halign:'center',fontStyle:'bold',textColor:polRgb(totDPct)}},
    ]],
    footStyles: FOOT_STYLE,
    showFoot:'lastPage',
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ── TABLE 2: Model Tier Rate Card ──────────────────────────────────── */
  y = sh('AI MODEL TIER RATE CARD  —  TOKEN UNIT ECONOMICS (INR per 1K Tokens, excl. GST)', y);

  doc.autoTable({
    startY: y,
    margin: { left:ML, right:MR },
    head: [[
      {content:'Model Identifier',  styles:{halign:'left'}},
      {content:'Input / 1K (₹)',    styles:{halign:'right'}},
      {content:'Output / 1K (₹)',   styles:{halign:'right'}},
      {content:'Avg Rate / 1K (₹)', styles:{halign:'right'}},
      {content:'CGST 9%',           styles:{halign:'right'}},
      {content:'SGST 9%',           styles:{halign:'right'}},
      {content:'Gross / 1K (₹)',    styles:{halign:'right'}},
      {content:'SAC Code',          styles:{halign:'center'}},
      {content:'Compliance',        styles:{halign:'center'}},
    ]],
    body: Object.entries(MODEL_PRICE).map(([key,m]) => {
      const pIn  = (m.prompt*1000);
      const pOut = (m.completion*1000);
      const avg  = ((pIn+pOut)/2);
      const cgst = avg*CGST_RATE;
      const sgst = avg*SGST_RATE;
      const gross= avg*1.18;
      return [
        {content:key,               styles:{font:'courier',fontSize:6.5}},
        {content:'₹'+pIn.toFixed(4),styles:{font:'courier',halign:'right'}},
        {content:'₹'+pOut.toFixed(4),styles:{font:'courier',halign:'right'}},
        {content:'₹'+avg.toFixed(4),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
        {content:'₹'+cgst.toFixed(4),styles:{font:'courier',halign:'right'}},
        {content:'₹'+sgst.toFixed(4),styles:{font:'courier',halign:'right'}},
        {content:'₹'+gross.toFixed(4),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
        {content:SAC_CODE,           styles:{halign:'center',textColor:C.navyMid}},
        {content:'COMPLIANT',        styles:{halign:'center',textColor:C.green,fontStyle:'bold'}},
      ];
    }),
    headStyles: HEAD_STYLE,
    bodyStyles: BODY_STYLE,
    alternateRowStyles: ALT_ROW,
    columnStyles:{
      0:{cellWidth:38},1:{cellWidth:22},2:{cellWidth:22},
      3:{cellWidth:24},4:{cellWidth:18},5:{cellWidth:18},
      6:{cellWidth:22},7:{cellWidth:14},8:{cellWidth:22},
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ── GOVERNANCE POLICY RULES ────────────────────────────────────────── */
  y = sh('AUTOMATED AI GOVERNANCE & POLICY ENFORCEMENT RULES', y);

  doc.setFillColor(...C.white);
  doc.rect(ML, y, BW, 24, 'F');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, BW, 24);

  const halfBW = (BW-5)/2;

  // Left: Policy definitions
  const policies = [
    { clr:C.green, label:'NORMAL  (< 80% Budget Used)',    detail:'Full access. Requests routed to primary model endpoints. No throttling.' },
    { clr:C.amber, label:'WARNING  (≥ 80% Budget Used)',   detail:'Fallback routing activated. Requests auto-downgraded to cost-optimized tiers.' },
    { clr:C.red,   label:'HARD CAP  (≥ 100% Budget Used)', detail:'API key suspended at proxy layer. All further requests blocked until next billing cycle.' },
  ];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.navyMid);
  doc.text('DYNAMIC ROUTING POLICY DEFINITIONS:', ML+3, y+5);

  policies.forEach((p,i) => {
    const ly = y+9+i*5;
    doc.setFillColor(...p.clr);
    doc.rect(ML+3, ly-2.5, 2.5, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...p.clr);
    doc.text(p.label, ML+8, ly);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(p.detail, ML+8, ly+3);
  });

  // Right: Loop detection
  const rx3 = ML+halfBW+5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.navyMid);
  doc.text('AGENTIC AI LOOP DETECTION RULES:', rx3, y+5);

  const loops = [
    'Completion / Prompt token ratio > 8× in single call',
    'More than 10 consecutive API calls from same Employee ID in < 60 sec',
    'Recursive tool-call depth > 5 levels in agentic frameworks',
  ];
  loops.forEach((l,i) => {
    const ly = y+9+i*5;
    doc.setFillColor(...C.red);
    doc.rect(rx3, ly-2.5, 2.5, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...C.ink);
    doc.text(l, rx3+5, ly);
  });

  /* ── PAGE FOOTER ──────────────────────────────────────────────────────── */
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, 284, W-MR, 284);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...C.muted);
  doc.text(`${CO_NAME}   |   GSTIN: ${CO_GSTIN}   |   SAC Code: ${SAC_CODE} — IT & Software Services`, ML, 288);
  doc.text('CONFIDENTIAL — Departmental FinOps Allocation. For Internal Finance & Compliance Use Only.', ML, 292);
  doc.setTextColor(...C.navyMid);
  doc.setFont('helvetica', 'bold');
  doc.text('Page 2 of 3', W-MR, 292, { align:'right' });
}

/* ═══════════════════════════════════════════════════════════
   SHEET 3 — RAW TELEMETRY APPENDIX & LOOP AUDIT LOG
   Landscape A4 | 297 × 210 mm
═══════════════════════════════════════════════════════════ */
function buildSheet3(doc, opts) {
  const W=297, ML=14, MR=14, BW=W-ML-MR;

  /* ── HEADER ──────────────────────────────────────────────────────────── */
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, W, 16, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(ML, 4, 1.5, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text('RAW TELEMETRY LEDGER  &  AGENTIC AI ANOMALY AUDIT LOG', ML+5, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(185, 200, 230);
  doc.text(`${opts.workspace}   |   ${opts.period}   |   Ref: ${INV_NO}`, W-MR, 11, { align:'right' });

  doc.setFillColor(...C.navyMid);
  doc.rect(0, 16, W, 4, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.white);
  doc.text('Sheet 3 of 3  —  Itemized Token-Level Transactions. Loop Audit: Completion/Prompt > 8× = LOOP DETECTED.  All values in INR (₹), IGST 18% applicable.', W/2, 19, { align:'center' });

  const y = 23;

  /* ── TELEMETRY TABLE ─────────────────────────────────────────────────── */
  doc.autoTable({
    startY: y,
    margin: { left:ML, right:MR },
    head: [[
      {content:'Timestamp',     styles:{halign:'left'}},
      {content:'Emp. ID',       styles:{halign:'left'}},
      {content:'Department',    styles:{halign:'left'}},
      {content:'Provider',      styles:{halign:'left'}},
      {content:'Model',         styles:{halign:'left'}},
      {content:'Prompt Tok.',   styles:{halign:'right'}},
      {content:'Comp. Tok.',    styles:{halign:'right'}},
      {content:'₹/1K Avg',      styles:{halign:'right'}},
      {content:'Net Cost (₹)',  styles:{halign:'right'}},
      {content:'IGST 18% (₹)', styles:{halign:'right'}},
      {content:'Total (₹)',     styles:{halign:'right'}},
      {content:'Policy',        styles:{halign:'center'}},
      {content:'Loop Audit',    styles:{halign:'center'}},
    ]],
    body: TELEM.map(r => {
      const mp  = MODEL_PRICE[r.model] || { prompt:0.0001, completion:0.0002 };
      const avg1k = (((mp.prompt+mp.completion)/2)*1000).toFixed(4);
      const gst   = Math.round(r.net*GST_RATE);
      const total = r.net+gst;
      return [
        {content:r.ts,                      styles:{font:'courier',fontSize:6.2,textColor:C.muted}},
        {content:r.eid,                     styles:{font:'courier',fontSize:6.2,textColor:[20,60,180]}},
        {content:r.dept,                    styles:{fontSize:6.8}},
        {content:r.prov,                    styles:{fontSize:6.8}},
        {content:r.model,                   styles:{font:'courier',fontSize:6.2}},
        {content:r.pt.toLocaleString('en-IN'),  styles:{font:'courier',halign:'right'}},
        {content:r.ct.toLocaleString('en-IN'),  styles:{font:'courier',halign:'right'}},
        {content:'₹'+avg1k,                 styles:{font:'courier',halign:'right',fontSize:6}},
        {content:inr(r.net),               styles:{font:'courier',halign:'right'}},
        {content:inr(gst),                 styles:{font:'courier',halign:'right'}},
        {content:inr(total),               styles:{font:'courier',halign:'right',fontStyle:'bold'}},
        {content:polLabel(r.pct),          styles:{halign:'center'}},
        {content:r.loop ? 'LOOP DETECTED' : 'NORMAL', styles:{halign:'center'}},
      ];
    }),
    headStyles: HEAD_STYLE,
    bodyStyles: { ...BODY_STYLE, fontSize:6.8 },
    alternateRowStyles: ALT_ROW,
    columnStyles:{
      0:{cellWidth:25},1:{cellWidth:21},2:{cellWidth:21},
      3:{cellWidth:19},4:{cellWidth:30},5:{cellWidth:17},
      6:{cellWidth:17},7:{cellWidth:18},8:{cellWidth:17},
      9:{cellWidth:17},10:{cellWidth:19},11:{cellWidth:14},12:{cellWidth:14},
    },
    willDrawCell(data) {
      if(data.section!=='body') return;
      const row = TELEM[data.row.index]; if(!row) return;
      const rgb = polRgb(row.pct);
      if(data.column.index===11) {
        data.cell.styles.textColor = rgb;
        data.cell.styles.fontStyle = 'bold';
      }
      if(data.column.index===12 && row.loop) {
        data.cell.styles.textColor  = C.red;
        data.cell.styles.fontStyle  = 'bold';
        data.cell.styles.fillColor  = [255,228,228];
      }
      if(data.column.index===12 && !row.loop) {
        data.cell.styles.textColor  = C.green;
      }
    },
    foot:[[
      {content:'TOTALS',colSpan:5,styles:{fontStyle:'bold',halign:'right'}},
      {content:TELEM.reduce((s,r)=>s+r.pt,0).toLocaleString('en-IN'),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:TELEM.reduce((s,r)=>s+r.ct,0).toLocaleString('en-IN'),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:''},
      {content:inr(TELEM.reduce((s,r)=>s+r.net,0)),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(Math.round(TELEM.reduce((s,r)=>s+r.net,0)*GST_RATE)),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:inr(Math.round(TELEM.reduce((s,r)=>s+r.net,0)*1.18)),styles:{font:'courier',halign:'right',fontStyle:'bold'}},
      {content:''},
      {content:`${TELEM.filter(r=>r.loop).length} LOOP(S)`,styles:{halign:'center',fontStyle:'bold',textColor:C.red}},
    ]],
    footStyles: FOOT_STYLE,
    showFoot:'lastPage',
    showHead:'everyPage',
    didDrawPage(data) {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(ML, 200, W-MR, 200);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...C.muted);
      doc.text(`${CO_NAME}   |   GSTIN: ${CO_GSTIN}   |   SAC: ${SAC_CODE}`, ML, 204);
      doc.text('CONFIDENTIAL — Raw Telemetry Appendix. For Audit, Tax Compliance & Billing Only.', W/2, 204, {align:'center'});
      doc.setTextColor(...C.navyMid);
      doc.setFont('helvetica','bold');
      doc.text(`Page 3 of 3`, W-MR, 204, {align:'right'});
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════════════════════ */
function showProgress() {
  const bar = document.getElementById('pdf-progress-bar');
  if (!bar) return;
  bar.style.opacity='1'; bar.style.transition='none'; bar.style.width='0%';
  requestAnimationFrame(() => { bar.style.transition='width 2.5s ease'; bar.style.width='80%'; });
}
function finishProgress() {
  const bar = document.getElementById('pdf-progress-bar');
  if (!bar) return;
  bar.style.transition='width 0.2s ease'; bar.style.width='100%';
  setTimeout(()=>{ bar.style.opacity='0'; bar.style.width='0%'; },400);
}

/* ═══════════════════════════════════════════════════════════
   MAIN ENTRY POINT
═══════════════════════════════════════════════════════════ */
export async function exportVantagePDF(options = {}) {
  const opts = {
    period:          options.period          || 'July 2026',
    workspace:       options.workspace       || CO_NAME,
    sigName:         options.sigName         || '',
    includeAppendix: options.includeAppendix !== false,
  };

  if (!window.jspdf?.jsPDF) {
    window.showToast?.('PDF library not loaded — refresh and retry.','error');
    return;
  }

  document.querySelectorAll('[data-pdf-trigger]').forEach(b => {
    b.disabled=true; b.setAttribute('aria-busy','true');
  });
  showProgress();

  const si = document.getElementById('spline-bg-iframe');
  const sc = document.getElementById('spline-bg-container');
  if (si) si.style.visibility='hidden';
  if (sc) sc.style.visibility='hidden';

  await new Promise(r => setTimeout(r, 60));

  try {
    const { jsPDF } = window.jspdf;

    // Sheet 1 — Portrait A4
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    buildSheet1(doc, opts);

    // Sheet 2 — Portrait A4
    doc.addPage([210, 297], 'portrait');
    buildSheet2(doc, opts);

    // Sheet 3 — Landscape A4
    if (opts.includeAppendix) {
      doc.addPage([297, 210], 'landscape');
      buildSheet3(doc, opts);
    }

    const fn = `Vantage_Billing_Packet_${opts.period.replace(/\s+/g,'_')}.pdf`;
    doc.save(fn);
    finishProgress();
    window.showToast?.(`Downloaded — ${fn}`,'success');

  } catch(err) {
    console.error('[PDF Error]', err);
    finishProgress();
    window.showToast?.('PDF generation failed. See console.','error');
  } finally {
    if (si) si.style.visibility='';
    if (sc) sc.style.visibility='';
    document.querySelectorAll('[data-pdf-trigger]').forEach(b => {
      b.disabled=false; b.removeAttribute('aria-busy');
    });
  }
}
