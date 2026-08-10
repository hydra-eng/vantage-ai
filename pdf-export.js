/**
 * Vantage AI — 3-Sheet Corporate Billing Packet
 * All pages: Portrait A4 (210 × 297 mm) — print-ready
 *
 * Color palette: Clean corporate white with deep-slate headers.
 * Modelled on TCS / Infosys / Deloitte / SAP billing documents.
 *
 * Requires jsPDF 2.5 + jspdf-autotable 3.8 (CDN-loaded before this module).
 */

/* ═══════════════════════════════════════════════════════════
   CORPORATE IDENTITY
═══════════════════════════════════════════════════════════ */
const CO = {
  name:   'TechCorp India Private Limited',
  addr1:  'Unit 4B, 4th Floor, Prestige Tech Park',
  addr2:  'Outer Ring Road, Bengaluru – 560 103, Karnataka, India',
  gstin:  '27AABCT1234N1Z5',
  pan:    'AABCT1234N',
  cin:    'U72900KA2018PTC112345',
  sac:    '998313',
  email:  'finance@techcorp.in',
  tel:    '+91 80 4123 5678',
};
const INV   = 'VTG-2026-07-INV-0041';
const IDATE = '31 July 2026';
const DDATE = '15 August 2026';

/* ═══════════════════════════════════════════════════════════
   PROFESSIONAL COLOR TOKENS
   Palette: Corporate slate-blue headers, clean white pages,
   hairline #E5E7EB borders — prints well on laser/inkjet.
═══════════════════════════════════════════════════════════ */
const P = {
  /* Page structure */
  headerBg:  [22,  44,  90],   // Deep corporate navy — header band
  headerSub: [38,  65,  120],  // Slightly lighter for sub-bands
  accent:    [37,  99,  235],  // Brand blue — accent lines & links
  white:     [255, 255, 255],
  black:     [10,  12,  18],

  /* Typography */
  ink:       [17,  24,  39],   // Near-black body text
  subtext:   [75,  85,  99],   // Secondary / label text
  caption:   [107, 114, 128],  // Fine print

  /* Table */
  thBg:      [42,  69,  130],  // Table column header fill
  thText:    [255, 255, 255],
  rowAlt:    [248, 250, 253],  // Very light blue-grey for even rows
  rowHover:  [239, 246, 255],
  border:    [214, 220, 231],  // Hairline cell border
  sectionBg: [237, 242, 252],  // Section header strip

  /* Status badges */
  green:     [21,  128, 61],
  greenBg:   [220, 252, 231],
  amber:     [161, 98,  7],
  amberBg:   [254, 243, 199],
  red:       [185, 28,  28],
  redBg:     [254, 226, 226],

  /* Footer */
  footerBg:  [30,  58,  138],
};

const GST = 0.18;

/* ═══════════════════════════════════════════════════════════
   DATA SETS
═══════════════════════════════════════════════════════════ */
const PROVIDERS = [
  { name:'OpenAI',           cat:'Text & Code API',   tok:9820000, net:112430, bud:200000, pct:89  },
  { name:'Anthropic Claude', cat:'Text & Code API',   tok:3410000, net:54180,  bud:80000,  pct:72  },
  { name:'Google Gemini',    cat:'Text & Code API',   tok:2980000, net:38290,  bud:63000,  pct:61  },
  { name:'Synthesia',        cat:'Video Generation',  tok:1120000, net:35280,  bud:37500,  pct:94  },
  { name:'GitHub Copilot',   cat:'Code Assistance',   tok:2650000, net:26600,  bud:25000,  pct:106 },
  { name:'Runway ML',        cat:'Video Generation',  tok:880000,  net:26160,  bud:32000,  pct:82  },
  { name:'Meta Llama',       cat:'Text & Code API',   tok:1440000, net:16370,  bud:30000,  pct:55  },
  { name:'ElevenLabs',       cat:'Audio & Speech',    tok:510000,  net:11440,  bud:24000,  pct:48  },
];

const DEPTS = [
  { name:'Engineering',      cc:'CC-ENG-101', users:11, tok:14210000, net:161820, bud:180000, pct:90 },
  { name:'Marketing',        cc:'CC-MKT-202', users:4,  tok:6600000,  net:60540,  bud:80000,  pct:76 },
  { name:'Data & Analytics', cc:'CC-DAT-303', users:3,  tok:4480000,  net:41200,  bud:65000,  pct:63 },
  { name:'Video Production', cc:'CC-VID-404', users:2,  tok:2680000,  net:38333,  bud:45000,  pct:85 },
  { name:'Operations',       cc:'CC-OPS-505', users:2,  tok:2200000,  net:18860,  bud:30000,  pct:63 },
];

const MODEL_RATES = {
  'gpt-4o':             { in:0.000416, out:0.001248 },
  'gpt-4-turbo':        { in:0.000832, out:0.002496 },
  'gpt-3.5-turbo':      { in:0.0000416,out:0.0000624},
  'claude-3-5-sonnet':  { in:0.000249, out:0.001247 },
  'claude-3-haiku':     { in:0.0000208,out:0.000104 },
  'gemini-1.5-pro':     { in:0.000104, out:0.000312 },
  'gemini-1.5-flash':   { in:0.0000104,out:0.0000312},
  'runway-gen3':        { in:0.000050, out:0.000200 },
  'synthesia-v2':       { in:0.000150, out:0.000450 },
  'copilot-chat':       { in:0.000104, out:0.000208 },
  'eleven-turbo-v2':    { in:0.000080, out:0.000240 },
};

const TELEM = [
  { ts:'2026-07-31 23:58',eid:'EMP-EN-001',dept:'Engineering',  prov:'OpenAI',    model:'gpt-4o',           pt:12400,ct:3820, net:7298, pct:89, loop:false},
  { ts:'2026-07-31 22:41',eid:'EMP-EN-002',dept:'Engineering',  prov:'OpenAI',    model:'gpt-4-turbo',      pt:8200, ct:1100, net:9527, pct:89, loop:false},
  { ts:'2026-07-31 21:30',eid:'EMP-EN-011',dept:'Engineering',  prov:'OpenAI',    model:'gpt-4o',           pt:3800, ct:31200,net:41590,pct:106,loop:true },
  { ts:'2026-07-31 20:15',eid:'EMP-VD-003',dept:'Video Prod.',  prov:'Runway ML', model:'runway-gen3',      pt:2100, ct:890,  net:4830, pct:85, loop:false},
  { ts:'2026-07-31 19:54',eid:'EMP-MK-007',dept:'Marketing',    prov:'OpenAI',    model:'gpt-4o',           pt:5400, ct:1620, net:3244, pct:76, loop:false},
  { ts:'2026-07-31 18:30',eid:'EMP-PD-004',dept:'Engineering',  prov:'Synthesia', model:'synthesia-v2',     pt:900,  ct:3600, net:8190, pct:90, loop:false},
  { ts:'2026-07-31 17:12',eid:'EMP-EN-005',dept:'Engineering',  prov:'Anthropic', model:'claude-3-5-sonnet',pt:11200,ct:2840, net:6324, pct:90, loop:false},
  { ts:'2026-07-31 16:45',eid:'EMP-DA-002',dept:'Data & Analy.',prov:'Google',    model:'gemini-1.5-pro',   pt:18600,ct:4200, net:3243, pct:63, loop:false},
  { ts:'2026-07-31 15:30',eid:'EMP-OP-001',dept:'Operations',   prov:'OpenAI',    model:'gpt-3.5-turbo',    pt:22000,ct:5800, net:1279, pct:63, loop:false},
  { ts:'2026-07-31 14:10',eid:'EMP-EN-008',dept:'Engineering',  prov:'GitHub',    model:'copilot-chat',     pt:9800, ct:2200, net:2185, pct:106,loop:false},
  { ts:'2026-07-31 13:55',eid:'EMP-MK-003',dept:'Marketing',    prov:'ElevenLabs',model:'eleven-turbo-v2',  pt:1200, ct:4800, net:2810, pct:76, loop:false},
  { ts:'2026-07-30 22:30',eid:'EMP-VD-001',dept:'Video Prod.',  prov:'Runway ML', model:'runway-gen3',      pt:1800, ct:720,  net:4153, pct:85, loop:false},
  { ts:'2026-07-30 20:15',eid:'EMP-EN-003',dept:'Engineering',  prov:'OpenAI',    model:'gpt-4o',           pt:6200, ct:1880, net:4889, pct:90, loop:false},
  { ts:'2026-07-30 18:40',eid:'EMP-PD-002',dept:'Engineering',  prov:'Anthropic', model:'claude-3-haiku',   pt:14400,ct:3600, net:677,  pct:90, loop:false},
  { ts:'2026-07-30 16:20',eid:'EMP-DA-005',dept:'Data & Analy.',prov:'Google',    model:'gemini-1.5-flash', pt:42000,ct:8400, net:877,  pct:63, loop:false},
];

/* ═══════════════════════════════════════════════════════════
   FORMATTERS
═══════════════════════════════════════════════════════════ */
function inr(n)  { return '\u20b9' + Math.round(n).toLocaleString('en-IN'); }
function inrL(n) {
  if (n >= 10000000) return '\u20b9' + (n/10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '\u20b9' + (n/100000).toFixed(2) + ' L';
  return inr(n);
}
function tokF(t) {
  return t >= 1000000 ? (t/1000000).toFixed(2)+'M' : t >= 1000 ? (t/1000).toFixed(1)+'K' : String(t);
}
function pLabel(p) { return p >= 100 ? 'HARD CAP' : p >= 80 ? 'WARNING' : 'NORMAL'; }
function pColor(p) { return p >= 100 ? P.red : p >= 80 ? P.amber : P.green; }

/* ═══════════════════════════════════════════════════════════
   COMMON DRAWING PRIMITIVES
═══════════════════════════════════════════════════════════ */

/** Draw the standard page header band. Returns y after header. */
function drawHeader(doc, W, ML, MR, title, subtitle, opts, pgLabel) {
  // Main navy band
  doc.setFillColor(...P.headerBg);
  doc.rect(0, 0, W, 26, 'F');

  // Left accent stripe — brand blue
  doc.setFillColor(...P.accent);
  doc.rect(0, 0, 3.5, 26, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...P.white);
  doc.text(title, ML + 4, 11);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 198, 235);
  doc.text(subtitle, ML + 4, 18.5);

  // Right meta
  doc.setFontSize(6.5);
  doc.setTextColor(180, 198, 235);
  doc.text(`Invoice: ${INV}`, W - MR, 9, { align: 'right' });
  doc.text(`Period: ${opts.period}   |   Entity: ${opts.workspace}`, W - MR, 14.5, { align: 'right' });
  doc.text(pgLabel, W - MR, 20, { align: 'right' });

  // Thin accent rule under header
  doc.setFillColor(...P.accent);
  doc.rect(0, 26, W, 1.2, 'F');

  return 31;
}

/** Draw a section label bar. Returns y after it. */
function sLabel(doc, ML, BW, y, text) {
  doc.setFillColor(...P.sectionBg);
  doc.rect(ML, y, BW, 5.5, 'F');
  doc.setDrawColor(...P.border);
  doc.setLineWidth(0.2);
  doc.rect(ML, y, BW, 5.5);
  // Left accent mark
  doc.setFillColor(...P.accent);
  doc.rect(ML, y, 2, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...P.headerBg);
  doc.text(text, ML + 5, y + 3.9);
  return y + 7.5;
}

/** Draw the standard page footer. */
function drawFooter(doc, W, ML, MR, pgLabel) {
  // Thin top rule
  doc.setDrawColor(...P.border);
  doc.setLineWidth(0.3);
  doc.line(ML, 283, W - MR, 283);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...P.caption);
  doc.text(`${CO.name}   |   GSTIN: ${CO.gstin}   |   PAN: ${CO.pan}   |   SAC: ${CO.sac}`, ML, 287);
  doc.text(`${CO.email}   |   ${CO.tel}`, ML, 291);
  doc.text('CONFIDENTIAL — FOR AUTHORISED BILLING, TAX & COMPLIANCE USE ONLY', W / 2, 287, { align: 'center' });
  doc.text('Computer-generated document — valid without manual signature unless stated otherwise.', W / 2, 291, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...P.headerBg);
  doc.text(pgLabel, W - MR, 287, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...P.caption);
  doc.text(`Invoice: ${INV}`, W - MR, 291, { align: 'right' });
}

/** Shared autoTable style objects */
function tStyles() {
  return {
    headStyles: {
      fillColor: P.thBg,
      textColor: P.thText,
      fontStyle: 'bold',
      fontSize: 6.8,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: P.thBg,
      lineWidth: 0,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: P.ink,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: P.border,
      lineWidth: 0.2,
    },
    alternateRowStyles: { fillColor: P.rowAlt },
    footStyles: {
      fillColor: P.headerBg,
      textColor: P.white,
      fontStyle: 'bold',
      fontSize: 7,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineWidth: 0,
    },
  };
}

/* ═══════════════════════════════════════════════════════════
   SHEET 1: OFFICIAL TAX INVOICE & EXECUTIVE SUMMARY
   Portrait A4  |  210 × 297 mm
═══════════════════════════════════════════════════════════ */
function buildSheet1(doc, opts) {
  const W=210, ML=14, MR=14, BW=W-ML-MR;

  let y = drawHeader(doc, W, ML, MR,
    'TAX INVOICE — AI SERVICES',
    `${CO.name}   |   GSTIN: ${CO.gstin}   |   CIN: ${CO.cin}   |   SAC: ${CO.sac} (IT-Enabled Services)`,
    opts, 'Sheet 1 of 3');

  /* ── BILLED TO / TAX CLASSIFICATION split ─── */
  const hBW = (BW - 4) / 2;

  // Box 1: Billed To
  doc.setFillColor(252, 253, 255);
  doc.rect(ML, y, hBW, 26, 'F');
  doc.setDrawColor(...P.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, hBW, 26);
  doc.setFillColor(...P.thBg);
  doc.rect(ML, y, hBW, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...P.white);
  doc.text('BILLED TO — CUSTOMER ENTITY', ML + 3, y + 3.2);

  const billedLines = [
    [opts.workspace, true],
    [`GSTIN: ${CO.gstin}   |   PAN: ${CO.pan}`, false],
    [CO.addr1, false],
    [CO.addr2, false],
    [`Tel: ${CO.tel}   |   ${CO.email}`, false],
  ];
  billedLines.forEach(([txt, bold], i) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 7.5 : 6.8);
    doc.setTextColor(bold ? ...P.ink : ...P.subtext);
    doc.text(txt, ML + 3, y + 8 + i * 3.8);
  });

  // Box 2: Invoice & Tax Reference
  const rx = ML + hBW + 4;
  doc.setFillColor(252, 253, 255);
  doc.rect(rx, y, hBW, 26, 'F');
  doc.setDrawColor(...P.border);
  doc.rect(rx, y, hBW, 26);
  doc.setFillColor(...P.thBg);
  doc.rect(rx, y, hBW, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...P.white);
  doc.text('INVOICE & TAX REFERENCE', rx + 3, y + 3.2);

  const refLines = [
    ['Invoice Number',     INV],
    ['Invoice Date',       IDATE],
    ['Due Date',           DDATE],
    ['Service Code',       `SAC ${CO.sac} — Information Technology Services`],
    ['Tax Type',           'IGST @ 18% (Interstate B2B Supply)'],
    ['Reverse Charge',     'Not Applicable'],
  ];
  refLines.forEach(([k, v], i) => {
    const ly = y + 8 + i * 3.1;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...P.subtext);
    doc.text(k + ':', rx + 3, ly);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...P.ink);
    doc.text(v, rx + hBW - 3, ly, { align: 'right' });
  });

  y += 30;

  /* ── 5 KPI TILES ─────────────────────────────── */
  const totalNet   = PROVIDERS.reduce((s, p) => s + p.net, 0);
  const totalCGST  = Math.round(totalNet * 0.09);
  const totalSGST  = Math.round(totalNet * 0.09);
  const totalIGST  = Math.round(totalNet * GST);
  const totalGross = totalNet + totalIGST;
  const totalBudg  = PROVIDERS.reduce((s, p) => s + p.bud, 0);
  const budgPct    = Math.round((totalNet / totalBudg) * 100);
  const totalTok   = PROVIDERS.reduce((s, p) => s + p.tok, 0);

  const kpis = [
    { lbl:'TAXABLE VALUE',  val: inrL(totalNet),    note:'Excl. GST',            clr: P.headerBg },
    { lbl:'CGST (9%)',      val: inrL(totalCGST),   note:'Central Tax',          clr: [42, 69, 130] },
    { lbl:'SGST (9%)',      val: inrL(totalSGST),   note:'State Tax',            clr: [42, 69, 130] },
    { lbl:'TOTAL PAYABLE',  val: inrL(totalGross),  note:'Incl. GST',            clr: P.accent },
    { lbl:'BUDGET HEALTH',  val: budgPct + '%',     note: pLabel(budgPct),       clr: pColor(budgPct) },
  ];

  const kW = (BW - 4 * 2) / 5;
  kpis.forEach((k, i) => {
    const cx = ML + i * (kW + 2);
    doc.setFillColor(...P.white);
    doc.rect(cx, y, kW, 17, 'F');
    doc.setDrawColor(...P.border);
    doc.setLineWidth(0.25);
    doc.rect(cx, y, kW, 17);
    // Bottom accent bar
    doc.setFillColor(...k.clr);
    doc.rect(cx, y + 15, kW, 2, 'F');
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...P.caption);
    doc.text(k.lbl, cx + kW / 2, y + 5.5, { align: 'center' });
    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...k.clr);
    doc.text(k.val, cx + kW / 2, y + 11, { align: 'center' });
    // Note
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...k.clr);
    doc.text(k.note, cx + kW / 2, y + 14.5, { align: 'center' });
  });

  y += 21;

  /* ── PROVIDER COST TABLE ──────────────────────── */
  y = sLabel(doc, ML, BW, y, 'SECTION 1  —  AI PROVIDER COST & TAX BREAKDOWN');
  const { headStyles, bodyStyles, alternateRowStyles, footStyles } = tStyles();

  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Provider',         styles: { halign: 'left'   } },
      { content: 'Service Type',     styles: { halign: 'left'   } },
      { content: 'Token Volume',     styles: { halign: 'right'  } },
      { content: 'Taxable Value',    styles: { halign: 'right'  } },
      { content: 'CGST 9%',         styles: { halign: 'right'  } },
      { content: 'SGST 9%',         styles: { halign: 'right'  } },
      { content: 'Total Incl. GST', styles: { halign: 'right'  } },
      { content: 'Budget',          styles: { halign: 'right'  } },
      { content: 'Util.%',          styles: { halign: 'center' } },
      { content: 'Status',          styles: { halign: 'center' } },
    ]],
    body: PROVIDERS.map(p => {
      const cgst = Math.round(p.net * 0.09), sgst = Math.round(p.net * 0.09);
      return [
        { content: p.name, styles: { fontStyle: 'bold' } },
        { content: p.cat,  styles: { textColor: P.subtext } },
        { content: tokF(p.tok), styles: { font: 'courier', halign: 'right' } },
        { content: inr(p.net),  styles: { font: 'courier', halign: 'right' } },
        { content: inr(cgst),   styles: { font: 'courier', halign: 'right' } },
        { content: inr(sgst),   styles: { font: 'courier', halign: 'right' } },
        { content: inr(p.net + cgst + sgst), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
        { content: inr(p.bud), styles: { font: 'courier', halign: 'right' } },
        { content: p.pct + '%',   styles: { halign: 'center' } },
        { content: pLabel(p.pct), styles: { halign: 'center' } },
      ];
    }),
    headStyles, bodyStyles, alternateRowStyles,
    columnStyles: {
      0:{cellWidth:26}, 1:{cellWidth:23}, 2:{cellWidth:18},
      3:{cellWidth:19}, 4:{cellWidth:15}, 5:{cellWidth:15},
      6:{cellWidth:22}, 7:{cellWidth:18}, 8:{cellWidth:10}, 9:{cellWidth:16},
    },
    willDrawCell(d) {
      if (d.section !== 'body') return;
      const p = PROVIDERS[d.row.index]; if (!p) return;
      if (d.column.index === 8 || d.column.index === 9) {
        d.cell.styles.textColor = pColor(p.pct);
        d.cell.styles.fontStyle = 'bold';
      }
    },
    foot: [[
      { content: 'GRAND TOTAL', colSpan: 2, styles: { halign: 'left', fontStyle: 'bold' } },
      { content: tokF(totalTok), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(totalNet),  styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(totalCGST), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(totalSGST), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(totalGross),styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(totalBudg), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: budgPct + '%',  styles: { halign: 'center', fontStyle: 'bold', textColor: pColor(budgPct) } },
      { content: pLabel(budgPct),styles: { halign: 'center', fontStyle: 'bold', textColor: pColor(budgPct) } },
    ]],
    footStyles, showFoot: 'lastPage',
  });

  y = doc.lastAutoTable.finalY + 5;

  /* ── TAX SUMMARY + BANK DETAILS ─────────────────── */
  y = sLabel(doc, ML, BW, y, 'SECTION 2  —  TAX AMOUNT SUMMARY & PAYMENT DETAILS');
  const boxH = 30, halfW = (BW - 4) / 2;

  // Left: Tax breakdown
  doc.setFillColor(252, 253, 255);
  doc.rect(ML, y, halfW, boxH, 'F');
  doc.setDrawColor(...P.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, halfW, boxH);
  doc.setFillColor(...P.thBg);
  doc.rect(ML, y, halfW, 4, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(...P.white);
  doc.text('TAX COMPUTATION (IGST BASIS)', ML + 3, y + 2.8);

  const taxRows = [
    ['Taxable Net Amount',       inr(totalNet),   false],
    ['CGST @ 9%',                inr(totalCGST),  false],
    ['SGST @ 9%',                inr(totalSGST),  false],
    ['IGST @ 18% (Interstate)',   inr(totalIGST),  false],
    ['Rounded Off',               '₹ 0.00',        false],
    ['TOTAL AMOUNT PAYABLE',      inr(totalGross), true],
  ];
  taxRows.forEach(([k, v, bold], i) => {
    const ly = y + 7 + i * 3.9;
    if (bold) {
      doc.setFillColor(...P.sectionBg);
      doc.rect(ML, ly - 2.5, halfW, 5, 'F');
    }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(7);
    doc.setTextColor(bold ? ...P.headerBg : ...P.subtext);
    doc.text(k, ML + 3, ly);
    doc.text(v, ML + halfW - 3, ly, { align: 'right' });
  });

  // Right: Bank details
  const rx = ML + halfW + 4;
  doc.setFillColor(252, 253, 255);
  doc.rect(rx, y, halfW, boxH, 'F');
  doc.setDrawColor(...P.border);
  doc.rect(rx, y, halfW, boxH);
  doc.setFillColor(...P.thBg);
  doc.rect(rx, y, halfW, 4, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(...P.white);
  doc.text('PAYMENT DETAILS — NEFT / RTGS / IMPS', rx + 3, y + 2.8);

  const bankRows = [
    ['Account Name',  CO.name],
    ['Bank',          'HDFC Bank Ltd. — Corporate Branch, Bengaluru'],
    ['Account No.',   '50200084729104'],
    ['IFSC Code',     'HDFC0000240'],
    ['Payment Ref.',  INV],
    ['Due By',        DDATE],
  ];
  bankRows.forEach(([k, v], i) => {
    const ly = y + 7 + i * 3.9;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(...P.subtext);
    doc.text(k + ':', rx + 3, ly);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); doc.setTextColor(...P.ink);
    doc.text(v, rx + halfW - 3, ly, { align: 'right' });
  });

  y += boxH + 5;

  /* ── EXECUTIVE SIGN-OFF ─────────────────────────── */
  y = sLabel(doc, ML, BW, y, 'SECTION 3  —  EXECUTIVE AUTHORIZATION & COMPLIANCE SIGN-OFF');
  const sigW = (BW - 2 * 4) / 3;
  const sigs = [
    { role: 'FINANCE DIRECTOR / CFO',      name: opts.sigName || 'Authorised Signatory' },
    { role: 'CISO / COMPLIANCE LEAD',       name: 'Security & Risk Officer' },
    { role: 'CTO / HEAD OF ENGINEERING',    name: 'AI Operations Head' },
  ];
  sigs.forEach((s, i) => {
    const sx = ML + i * (sigW + 4);
    doc.setFillColor(252, 253, 255);
    doc.rect(sx, y, sigW, 20, 'F');
    doc.setDrawColor(...P.border);
    doc.setLineWidth(0.3);
    doc.rect(sx, y, sigW, 20);
    doc.setFillColor(...P.thBg);
    doc.rect(sx, y, sigW, 4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.8); doc.setTextColor(...P.white);
    doc.text(s.role, sx + sigW / 2, y + 2.8, { align: 'center' });

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...P.subtext);
    doc.text(s.name, sx + 3, y + 9.5);

    doc.setDrawColor(...P.subtext);
    doc.setLineWidth(0.3);
    doc.line(sx + 3, y + 14.5, sx + sigW - 3, y + 14.5);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); doc.setTextColor(...P.caption);
    doc.text('Signature & Official Seal         Date: _____ / _____ / _______', sx + 3, y + 18.5);
  });

  drawFooter(doc, W, ML, MR, 'Sheet 1 of 3');
}

/* ═══════════════════════════════════════════════════════════
   SHEET 2: DEPARTMENTAL FINOPS & MODEL UNIT ECONOMICS
   Portrait A4  |  210 × 297 mm
═══════════════════════════════════════════════════════════ */
function buildSheet2(doc, opts) {
  const W=210, ML=14, MR=14, BW=W-ML-MR;

  let y = drawHeader(doc, W, ML, MR,
    'DEPARTMENTAL FINOPS ALLOCATION — MODEL ECONOMICS',
    `Cost Center Breakdown, Token Unit Pricing & Automated Governance Policy Rules`,
    opts, 'Sheet 2 of 3');

  const { headStyles, bodyStyles, alternateRowStyles, footStyles } = tStyles();

  const totDN  = DEPTS.reduce((s, d) => s + d.net, 0);
  const totDB  = DEPTS.reduce((s, d) => s + d.bud, 0);
  const totDH  = DEPTS.reduce((s, d) => s + d.users, 0);
  const totDT  = DEPTS.reduce((s, d) => s + d.tok, 0);
  const totDPct= Math.round((totDN / totDB) * 100);

  /* ── DEPT COST ALLOCATION TABLE ──────────────────── */
  y = sLabel(doc, ML, BW, y, 'SECTION 1  —  DEPARTMENTAL COST CENTER ALLOCATION');

  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Department',     styles: { halign: 'left'   } },
      { content: 'Cost Center',    styles: { halign: 'left'   } },
      { content: 'Users',          styles: { halign: 'center' } },
      { content: 'Token Volume',   styles: { halign: 'right'  } },
      { content: 'Taxable (₹)',    styles: { halign: 'right'  } },
      { content: 'CGST 9% (₹)',    styles: { halign: 'right'  } },
      { content: 'SGST 9% (₹)',    styles: { halign: 'right'  } },
      { content: 'Gross Total (₹)',styles: { halign: 'right'  } },
      { content: 'Budget (₹)',     styles: { halign: 'right'  } },
      { content: 'Util.',          styles: { halign: 'center' } },
      { content: 'Status',         styles: { halign: 'center' } },
    ]],
    body: DEPTS.map(d => {
      const cgst = Math.round(d.net * 0.09), sgst = Math.round(d.net * 0.09);
      return [
        { content: d.name, styles: { fontStyle: 'bold' } },
        { content: d.cc,   styles: { font: 'courier', fontSize: 6.2, textColor: P.subtext } },
        { content: d.users,styles: { halign: 'center' } },
        { content: tokF(d.tok), styles: { font: 'courier', halign: 'right' } },
        { content: inr(d.net),  styles: { font: 'courier', halign: 'right' } },
        { content: inr(cgst),   styles: { font: 'courier', halign: 'right' } },
        { content: inr(sgst),   styles: { font: 'courier', halign: 'right' } },
        { content: inr(d.net + cgst + sgst), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
        { content: inr(d.bud), styles: { font: 'courier', halign: 'right' } },
        { content: d.pct + '%',   styles: { halign: 'center' } },
        { content: pLabel(d.pct), styles: { halign: 'center' } },
      ];
    }),
    headStyles, bodyStyles, alternateRowStyles,
    columnStyles: {
      0:{cellWidth:26}, 1:{cellWidth:21}, 2:{cellWidth:10},
      3:{cellWidth:18}, 4:{cellWidth:19}, 5:{cellWidth:15},
      6:{cellWidth:15}, 7:{cellWidth:21}, 8:{cellWidth:18},
      9:{cellWidth:10}, 10:{cellWidth:9},
    },
    willDrawCell(d) {
      if (d.section !== 'body') return;
      const dep = DEPTS[d.row.index]; if (!dep) return;
      if (d.column.index === 9 || d.column.index === 10) {
        d.cell.styles.textColor = pColor(dep.pct);
        d.cell.styles.fontStyle = 'bold';
      }
    },
    foot: [[
      { content: 'TOTALS', colSpan: 2, styles: { fontStyle: 'bold', halign: 'left' } },
      { content: totDH,    styles: { halign: 'center', fontStyle: 'bold' } },
      { content: tokF(totDT),  styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(totDN),   styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(Math.round(totDN*0.09)), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(Math.round(totDN*0.09)), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(Math.round(totDN*1.18)), styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: inr(totDB),   styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
      { content: totDPct + '%',styles: { halign: 'center', fontStyle: 'bold', textColor: pColor(totDPct) } },
      { content: pLabel(totDPct),styles:{ halign: 'center', fontStyle: 'bold', textColor: pColor(totDPct) } },
    ]],
    footStyles, showFoot: 'lastPage',
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ── MODEL RATE CARD ──────────────────────────── */
  y = sLabel(doc, ML, BW, y, 'SECTION 2  —  AI MODEL TIER UNIT ECONOMICS (₹ PER 1K TOKENS, EXCL. GST)');

  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Model Identifier',  styles: { halign: 'left'  } },
      { content: 'Input / 1K (₹)',    styles: { halign: 'right' } },
      { content: 'Output / 1K (₹)',   styles: { halign: 'right' } },
      { content: 'Avg / 1K (₹)',      styles: { halign: 'right' } },
      { content: 'Gross / 1K (₹)',    styles: { halign: 'right' } },
      { content: 'SAC Code',          styles: { halign: 'center'} },
      { content: 'GST Rate',          styles: { halign: 'center'} },
      { content: 'Compliance',        styles: { halign: 'center'} },
    ]],
    body: Object.entries(MODEL_RATES).map(([key, m]) => {
      const inp   = (m.in * 1000);
      const out   = (m.out * 1000);
      const avg   = ((inp + out) / 2);
      const gross = avg * 1.18;
      return [
        { content: key,              styles: { font: 'courier', fontSize: 6.5 } },
        { content: '₹'+inp.toFixed(4),  styles: { font: 'courier', halign: 'right' } },
        { content: '₹'+out.toFixed(4),  styles: { font: 'courier', halign: 'right' } },
        { content: '₹'+avg.toFixed(4),  styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
        { content: '₹'+gross.toFixed(4),styles: { font: 'courier', halign: 'right', fontStyle: 'bold' } },
        { content: CO.sac,              styles: { halign: 'center', textColor: P.headerBg, fontStyle: 'bold' } },
        { content: '18%',               styles: { halign: 'center' } },
        { content: 'COMPLIANT',         styles: { halign: 'center', textColor: P.green, fontStyle: 'bold' } },
      ];
    }),
    headStyles, bodyStyles, alternateRowStyles,
    columnStyles: {
      0:{cellWidth:36}, 1:{cellWidth:22}, 2:{cellWidth:22},
      3:{cellWidth:22}, 4:{cellWidth:24}, 5:{cellWidth:15},
      6:{cellWidth:14}, 7:{cellWidth:27},
    },
    showFoot: 'lastPage',
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ── GOVERNANCE RULES BOX ────────────────────── */
  y = sLabel(doc, ML, BW, y, 'SECTION 3  —  AUTOMATED AI GOVERNANCE & ENFORCEMENT POLICY');

  doc.setFillColor(252, 253, 255);
  doc.rect(ML, y, BW, 26, 'F');
  doc.setDrawColor(...P.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, BW, 26);

  const halfBW = (BW - 5) / 2;
  const rules = [
    { clr: P.green, hd: 'NORMAL  (< 80% Budget Used)',    body: 'Full access. Primary model endpoints. No restrictions or throttling applied.' },
    { clr: P.amber, hd: 'WARNING  (≥ 80% Budget Used)',   body: 'Auto-fallback to cost-tier models (e.g. Flash, Haiku). Finance alert dispatched.' },
    { clr: P.red,   hd: 'HARD CAP  (≥ 100% Budget Used)', body: 'API key suspended immediately at proxy. Requests blocked until next billing cycle.' },
  ];
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); doc.setTextColor(...P.headerBg);
  doc.text('DYNAMIC ROUTING POLICIES:', ML + 4, y + 5.5);
  rules.forEach((r, i) => {
    const ry = y + 9.5 + i * 5.5;
    doc.setFillColor(...r.clr);
    doc.rect(ML + 4, ry - 2.8, 2.5, 3.2, 'F');
    doc.setFont('helvetica', 'bold');   doc.setFontSize(6.2); doc.setTextColor(...r.clr);
    doc.text(r.hd, ML + 9, ry);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.2); doc.setTextColor(...P.subtext);
    doc.text(r.body, ML + 9, ry + 3);
  });

  const loopRules = [
    'Output/Input token ratio > 8× in a single API call',
    'More than 10 consecutive calls from same Employee ID within 60 sec',
    'Recursive tool-call depth exceeds 5 levels in agentic pipelines',
  ];
  const rx2 = ML + halfBW + 5;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); doc.setTextColor(...P.red);
  doc.text('AGENTIC LOOP DETECTION TRIGGERS:', rx2, y + 5.5);
  loopRules.forEach((l, i) => {
    const ry = y + 9.5 + i * 5.5;
    doc.setFillColor(...P.red);
    doc.rect(rx2, ry - 2.8, 2.5, 3.2, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.2); doc.setTextColor(...P.ink);
    doc.text(l, rx2 + 5, ry);
  });

  drawFooter(doc, W, ML, MR, 'Sheet 2 of 3');
}

/* ═══════════════════════════════════════════════════════════
   SHEET 3: RAW TELEMETRY APPENDIX — PORTRAIT A4
   210 × 297 mm (same as sheets 1 & 2)
═══════════════════════════════════════════════════════════ */
function buildSheet3(doc, opts) {
  const W=210, ML=14, MR=14, BW=W-ML-MR;

  let y = drawHeader(doc, W, ML, MR,
    'RAW TELEMETRY LEDGER & AGENTIC AI AUDIT LOG',
    `Itemised API Transactions — Token-Level Cost, IGST 18%, Loop Detection & Policy Status`,
    opts, 'Sheet 3 of 3');

  const { headStyles, bodyStyles, alternateRowStyles, footStyles } = tStyles();

  y = sLabel(doc, ML, BW, y, `SECTION 1  —  ITEMISED API CALL LEDGER (${TELEM.length} TRANSACTIONS, ${opts.period.toUpperCase()})`);

  // Portrait A4 — 12 columns in 182mm usable width
  doc.autoTable({
    startY: y,
    margin: { left: ML, right: MR },
    head: [[
      { content: 'Timestamp',    styles: { halign: 'left'  } },
      { content: 'Emp. ID',      styles: { halign: 'left'  } },
      { content: 'Department',   styles: { halign: 'left'  } },
      { content: 'Provider',     styles: { halign: 'left'  } },
      { content: 'Model',        styles: { halign: 'left'  } },
      { content: 'Prompt',       styles: { halign: 'right' } },
      { content: 'Completion',   styles: { halign: 'right' } },
      { content: 'Net (₹)',      styles: { halign: 'right' } },
      { content: 'GST (₹)',      styles: { halign: 'right' } },
      { content: 'Total (₹)',    styles: { halign: 'right' } },
      { content: 'Policy',       styles: { halign: 'center'} },
      { content: 'Loop',         styles: { halign: 'center'} },
    ]],
    body: TELEM.map(r => {
      const gst   = Math.round(r.net * GST);
      const total = r.net + gst;
      return [
        { content: r.ts,   styles: { font: 'courier', fontSize: 6, textColor: P.subtext } },
        { content: r.eid,  styles: { font: 'courier', fontSize: 6, textColor: P.accent  } },
        { content: r.dept, styles: { fontSize: 6.5 } },
        { content: r.prov, styles: { fontSize: 6.5 } },
        { content: r.model,styles: { font: 'courier', fontSize: 6 } },
        { content: r.pt.toLocaleString('en-IN'),  styles: { font: 'courier', halign: 'right', fontSize: 6.5 } },
        { content: r.ct.toLocaleString('en-IN'),  styles: { font: 'courier', halign: 'right', fontSize: 6.5 } },
        { content: inr(r.net),   styles: { font: 'courier', halign: 'right', fontSize: 6.5 } },
        { content: inr(gst),     styles: { font: 'courier', halign: 'right', fontSize: 6.5 } },
        { content: inr(total),   styles: { font: 'courier', halign: 'right', fontSize: 6.5, fontStyle: 'bold' } },
        { content: pLabel(r.pct),styles: { halign: 'center', fontSize: 6 } },
        { content: r.loop ? 'LOOP' : 'OK', styles: { halign: 'center', fontSize: 6 } },
      ];
    }),
    headStyles: { ...headStyles, fontSize: 6.5, cellPadding: { top:2.5, bottom:2.5, left:2.5, right:2.5 } },
    bodyStyles:  { ...bodyStyles,  fontSize: 6.5, cellPadding: { top:2.2, bottom:2.2, left:2.5, right:2.5 } },
    alternateRowStyles,
    columnStyles: {
      0:{cellWidth:21}, 1:{cellWidth:18}, 2:{cellWidth:17},
      3:{cellWidth:16}, 4:{cellWidth:26}, 5:{cellWidth:13},
      6:{cellWidth:15}, 7:{cellWidth:14}, 8:{cellWidth:13},
      9:{cellWidth:15}, 10:{cellWidth:11},11:{cellWidth:9},
    },
    willDrawCell(d) {
      if (d.section !== 'body') return;
      const row = TELEM[d.row.index]; if (!row) return;
      if (d.column.index === 10) {
        d.cell.styles.textColor = pColor(row.pct);
        d.cell.styles.fontStyle = 'bold';
      }
      if (d.column.index === 11 && row.loop) {
        d.cell.styles.textColor  = P.red;
        d.cell.styles.fontStyle  = 'bold';
        d.cell.styles.fillColor  = P.redBg;
      }
      if (d.column.index === 11 && !row.loop) {
        d.cell.styles.textColor = P.green;
        d.cell.styles.fontStyle = 'bold';
      }
    },
    foot: [[
      { content: 'TOTALS', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: TELEM.reduce((s,r)=>s+r.pt,0).toLocaleString('en-IN'),  styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: TELEM.reduce((s,r)=>s+r.ct,0).toLocaleString('en-IN'),  styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: inr(TELEM.reduce((s,r)=>s+r.net,0)),                    styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: inr(Math.round(TELEM.reduce((s,r)=>s+r.net,0)*GST)),    styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: inr(Math.round(TELEM.reduce((s,r)=>s+r.net,0)*1.18)),   styles: { font:'courier', halign:'right', fontStyle:'bold' } },
      { content: '' },
      { content: `${TELEM.filter(r=>r.loop).length} LOOP(S)`, styles: { halign:'center', fontStyle:'bold', textColor: P.red } },
    ]],
    footStyles, showFoot: 'lastPage', showHead: 'everyPage',
    rowPageBreak: 'avoid',
    didDrawPage() {
      drawFooter(doc, W, ML, MR, 'Sheet 3 of 3');
    },
  });

  y = doc.lastAutoTable.finalY + 5;

  /* ── AUDIT CERTIFICATION BOX ─────────────────── */
  y = sLabel(doc, ML, BW, y, 'SECTION 2  —  TELEMETRY AUDIT CERTIFICATION & COMPLIANCE SIGN-OFF');

  const certH = Math.min(30, 280 - y);
  if (certH > 10) {
    doc.setFillColor(252, 253, 255);
    doc.rect(ML, y, BW, certH, 'F');
    doc.setDrawColor(...P.border);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, BW, certH);

    const halfCW = (BW - 5) / 2;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...P.headerBg);
    doc.text('AUDIT CERTIFICATION:', ML + 4, y + 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...P.subtext);
    doc.text('This 3-sheet billing packet is generated by Vantage AI and contains verified', ML + 4, y + 11);
    doc.text('raw telemetry sourced from live API provider logs. IGST @ 18% is computed', ML + 4, y + 15);
    doc.text(`under SAC ${CO.sac}. All amounts are in Indian Rupees (INR).`, ML + 4, y + 19);

    const rx3 = ML + halfCW + 5;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(...P.headerBg);
    doc.text('INTERNAL CONTROL AUDITOR:', rx3, y + 6);
    doc.setDrawColor(...P.subtext); doc.setLineWidth(0.35);
    doc.line(rx3, y + 18, rx3 + halfCW - 2, y + 18);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(...P.caption);
    doc.text('Signature & Official Stamp              Date: _____ / _____ / _______', rx3, y + 22);
  }
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS BAR HELPERS
═══════════════════════════════════════════════════════════ */
function showProgress() {
  const b = document.getElementById('pdf-progress-bar');
  if (!b) return;
  b.style.opacity = '1'; b.style.transition = 'none'; b.style.width = '0%';
  requestAnimationFrame(() => { b.style.transition = 'width 2s ease'; b.style.width = '80%'; });
}
function finishProgress() {
  const b = document.getElementById('pdf-progress-bar');
  if (!b) return;
  b.style.transition = 'width 0.2s'; b.style.width = '100%';
  setTimeout(() => { b.style.opacity = '0'; b.style.width = '0%'; }, 400);
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT ENTRY POINT
═══════════════════════════════════════════════════════════ */
export async function exportVantagePDF(options = {}) {
  const opts = {
    period:          options.period          || 'July 2026',
    workspace:       options.workspace       || CO.name,
    sigName:         options.sigName         || '',
    includeAppendix: options.includeAppendix !== false,
  };

  if (!window.jspdf?.jsPDF) {
    window.showToast?.('PDF library not loaded — please refresh and retry.', 'error');
    return;
  }

  document.querySelectorAll('[data-pdf-trigger]').forEach(b => {
    b.disabled = true; b.setAttribute('aria-busy', 'true');
  });
  showProgress();

  const si = document.getElementById('spline-bg-iframe');
  const sc = document.getElementById('spline-bg-container');
  if (si) si.style.visibility = 'hidden';
  if (sc) sc.style.visibility = 'hidden';

  await new Promise(r => setTimeout(r, 60));

  try {
    const { jsPDF } = window.jspdf;

    /* All 3 sheets — Portrait A4 */
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    buildSheet1(doc, opts);

    doc.addPage([210, 297], 'portrait');
    buildSheet2(doc, opts);

    if (opts.includeAppendix) {
      doc.addPage([210, 297], 'portrait');
      buildSheet3(doc, opts);
    }

    const fn = `Vantage_Billing_Packet_${opts.period.replace(/\s+/g, '_')}.pdf`;
    doc.save(fn);
    finishProgress();
    window.showToast?.(`Downloaded — ${fn}`, 'success');

  } catch (err) {
    console.error('[PDF]', err);
    finishProgress();
    window.showToast?.('PDF generation failed. See console for details.', 'error');
  } finally {
    if (si) si.style.visibility = '';
    if (sc) sc.style.visibility = '';
    document.querySelectorAll('[data-pdf-trigger]').forEach(b => {
      b.disabled = false; b.removeAttribute('aria-busy');
    });
  }
}
