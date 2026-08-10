// ============================================================
// INR — Indian number formatting (en-IN locale)
// ₹1,12,430 — lakh/crore grouping, IBM Plex Mono in UI
// ============================================================
const fmtINR = (n,d=0) => n==null?'—':'₹'+Math.round(n).toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtCredit = (n,unit) => {if(n==null)return '—';if(unit==='inr')return fmtINR(n);if(unit==='characters')return (n>=1e5?(n/1e5).toFixed(1)+'L':n>=1e3?(n/1e3).toFixed(0)+'K':n)+' chars';return n.toLocaleString('en-IN')+' '+unit};
const timeAgo = s => {if(!s)return '—';const m=Math.floor((Date.now()-new Date(s))/60000);if(m<60)return m+'m ago';const h=Math.floor(m/60);if(h<24)return h+'h ago';return Math.floor(h/24)+'d ago'};

// ============================================================
// DATA MODELS
// ============================================================
const TIERS={live:'Live API',activity:'Activity only',manual:'Manual import'};

const providers=[
  {id:'openai',nm:'OpenAI',abbr:'OA',cat:'text',tier:'live',unit:'inr',limit:150000,used:112430,costPerUnit:1},
  {id:'anthropic',nm:'Anthropic Claude',abbr:'CL',cat:'text',tier:'live',unit:'inr',limit:80000,used:54180,costPerUnit:1},
  {id:'gemini',nm:'Google Gemini',abbr:'GG',cat:'text',tier:'live',unit:'inr',limit:60000,used:38290,costPerUnit:1},
  {id:'copilot',nm:'GitHub Copilot',abbr:'GC',cat:'code',tier:'activity',unit:'seats',limit:25,used:19,pricePerSeat:1400},
  {id:'mistral',nm:'Mistral AI',abbr:'MS',cat:'text',tier:'live',unit:'inr',limit:30000,used:14280,costPerUnit:1},
  {id:'perplexity',nm:'Perplexity Pro',abbr:'PP',cat:'text',tier:'manual',unit:'inr',limit:20000,used:8400,costPerUnit:1},
  {id:'higgsfield',nm:'Higgsfield',abbr:'HF',cat:'video',tier:'live',unit:'renders',limit:500,used:342,costPerUnit:48},
  {id:'runway',nm:'Runway ML',abbr:'RW',cat:'video',tier:'live',unit:'credits',limit:3000,used:2180,costPerUnit:12},
  {id:'pika',nm:'Pika Labs',abbr:'PK',cat:'video',tier:'activity',unit:'credits',limit:2000,used:890,costPerUnit:10},
  {id:'kling',nm:'Kling AI',abbr:'KG',cat:'video',tier:'manual',unit:'renders',limit:150,used:67,costPerUnit:35},
  {id:'luma',nm:'Luma Dream Machine',abbr:'LM',cat:'video',tier:'activity',unit:'generations',limit:400,used:156,costPerUnit:28},
  {id:'synthesia',nm:'Synthesia',abbr:'SY',cat:'video',tier:'manual',unit:'minutes',limit:120,used:84,costPerUnit:420},
  {id:'elevenlabs',nm:'ElevenLabs',abbr:'EL',cat:'voice',tier:'live',unit:'characters',limit:500000,used:312000,costPerUnit:0.004},
  {id:'midjourney',nm:'Midjourney',abbr:'MJ',cat:'image',tier:'manual',unit:'images',limit:300,used:145,costPerUnit:38},
  {id:'firefly',nm:'Adobe Firefly',abbr:'FF',cat:'image',tier:'activity',unit:'credits',limit:1000,used:423,costPerUnit:8},
];

const provCost=p=>{
  if(p.unit==='inr')return p.used;
  if(p.unit==='seats')return p.used*(p.pricePerSeat||0);
  return Math.round(p.used*p.costPerUnit);
};

const teams=[
  {id:'eng',nm:'Engineering',lead:'Aditya Sharma',budget:150000,spent:134260},
  {id:'mkt',nm:'Marketing',lead:'Simran Kaur',budget:50000,spent:32450},
  {id:'vid',nm:'Video Editing',lead:'Divya Krishnan',budget:120000,spent:104383},
  {id:'dat',nm:'Data & Analytics',lead:'Sundar Rajan',budget:80000,spent:59420},
  {id:'ops',nm:'Operations',lead:'Karan Mehra',budget:20000,spent:9040},
];

const employees=[
  {id:'e03',nm:'Karthik Subramaniam',email:'karthik.s@techcorp.in',av:'KS',team:'eng',role:'ML Engineer',cost:36180,last:'2026-07-28T11:50:00Z',anomaly:true,anomalyReason:'Cost spike: +280% above 3-month average. 3-mo avg ₹9,500/month → Jul ₹36,180. o1-preview model calls detected 24–27 Jul.',tools:['openai','anthropic','gemini','mistral'],usage:[{p:'openai',unit:'inr',used:19840,note:'Spike — o1-preview usage 24–27 Jul'},{p:'anthropic',unit:'inr',used:8940},{p:'gemini',unit:'inr',used:4280},{p:'mistral',unit:'inr',used:3120}]},
  {id:'e12',nm:'Divya Krishnan',email:'divya.krishnan@techcorp.in',av:'DK',team:'vid',role:'Video Lead',cost:34200,last:'2026-07-28T10:15:00Z',anomaly:false,tools:['higgsfield','runway','elevenlabs','firefly'],usage:[{p:'higgsfield',unit:'renders',used:187,limit:250,cost:8976},{p:'runway',unit:'credits',used:890,limit:1000,cost:10680},{p:'elevenlabs',unit:'characters',used:145000,limit:200000,cost:580},{p:'firefly',unit:'credits',used:210,limit:300,cost:1680}]},
  {id:'e01',nm:'Aditya Sharma',email:'aditya.sharma@techcorp.in',av:'AS',team:'eng',role:'Staff Engineer',cost:24380,last:'2026-07-28T11:30:00Z',anomaly:false,tools:['openai','anthropic','copilot','gemini'],usage:[{p:'openai',unit:'inr',used:12840},{p:'anthropic',unit:'inr',used:7420},{p:'copilot',unit:'seats',used:1,note:'Activity only'},{p:'gemini',unit:'inr',used:4120}]},
  {id:'e13',nm:'Meera Iyer',email:'meera.iyer@techcorp.in',av:'MI',team:'vid',role:'Video Editor',cost:21840,last:'2026-07-28T11:30:00Z',anomaly:false,tools:['runway','pika','kling'],usage:[{p:'runway',unit:'credits',used:780,limit:1000,cost:9360},{p:'pika',unit:'credits',used:420,limit:600,cost:4200},{p:'kling',unit:'renders',used:34,limit:60,cost:1190}]},
  {id:'e06',nm:'Priya Malhotra',email:'priya.malhotra@techcorp.in',av:'PM',team:'eng',role:'Backend Engineer',cost:21680,last:'2026-07-28T11:10:00Z',anomaly:false,tools:['openai','anthropic','copilot'],usage:[{p:'openai',unit:'inr',used:10840},{p:'anthropic',unit:'inr',used:7380},{p:'copilot',unit:'seats',used:1,note:'Activity only'}]},
  {id:'e14',nm:'Rohan Chaudhary',email:'rohan.chaudhary@techcorp.in',av:'RC',team:'vid',role:'Motion Designer',cost:19750,last:'2026-07-28T09:00:00Z',anomaly:true,shadowAI:true,anomalyReason:'Unauthorized tool detected: Sora (OpenAI) — not on the approved provider list. Detected via network log analysis on 26 Jul 2026.',tools:['higgsfield','runway','midjourney'],usage:[{p:'higgsfield',unit:'renders',used:98,limit:150,cost:4704},{p:'runway',unit:'credits',used:510,limit:600,cost:6120},{p:'midjourney',unit:'images',used:65,limit:80,cost:2470},{p:'sora-unauth',unit:'generations',used:18,limit:null,cost:null,shadow:true,nm:'Sora (OpenAI)'}]},
  {id:'e17',nm:'Sundar Rajan',email:'sundar.rajan@techcorp.in',av:'SR',team:'dat',role:'Head of Data',cost:18780,last:'2026-07-28T11:00:00Z',anomaly:false,tools:['openai','anthropic','gemini'],usage:[{p:'openai',unit:'inr',used:8840},{p:'anthropic',unit:'inr',used:5940},{p:'gemini',unit:'inr',used:4000}]},
  {id:'e02',nm:'Arjun Reddy',email:'arjun.reddy@techcorp.in',av:'AR',team:'eng',role:'Senior Engineer',cost:18640,last:'2026-07-28T10:45:00Z',anomaly:false,tools:['openai','copilot','mistral'],usage:[{p:'openai',unit:'inr',used:11280},{p:'copilot',unit:'seats',used:1,note:'Activity only'},{p:'mistral',unit:'inr',used:7360}]},
  {id:'e15',nm:'Neha Gandhi',email:'neha.gandhi@techcorp.in',av:'NG',team:'vid',role:'Content Creator',cost:16340,last:'2026-07-27T17:30:00Z',anomaly:false,tools:['pika','luma','elevenlabs'],usage:[{p:'pika',unit:'credits',used:360,limit:500,cost:3600},{p:'luma',unit:'generations',used:84,limit:120,cost:2352},{p:'elevenlabs',unit:'characters',used:88000,limit:120000,cost:352}]},
  {id:'e18',nm:'Debashish Roy',email:'debashish.roy@techcorp.in',av:'DR',team:'dat',role:'Data Scientist',cost:14240,last:'2026-07-28T10:20:00Z',anomaly:false,tools:['openai','gemini','mistral'],usage:[{p:'openai',unit:'inr',used:6940},{p:'gemini',unit:'inr',used:4380},{p:'mistral',unit:'inr',used:2920}]},
  {id:'e19',nm:'Ananya Bose',email:'ananya.bose@techcorp.in',av:'AB',team:'dat',role:'Data Analyst',cost:13890,last:'2026-07-28T09:50:00Z',anomaly:false,tools:['openai','anthropic','perplexity'],usage:[{p:'openai',unit:'inr',used:7890},{p:'anthropic',unit:'inr',used:4840},{p:'perplexity',unit:'inr',used:1160}]},
  {id:'e04',nm:'Ishaan Kapoor',email:'ishaan.kapoor@techcorp.in',av:'IK',team:'eng',role:'DevOps Engineer',cost:12840,last:'2026-07-28T09:20:00Z',anomaly:false,tools:['openai','copilot'],usage:[{p:'openai',unit:'inr',used:8640},{p:'copilot',unit:'seats',used:1,note:'Activity only'}]},
  {id:'e08',nm:'Simran Kaur',email:'simran.kaur@techcorp.in',av:'SK',team:'mkt',role:'Marketing Lead',cost:12840,last:'2026-07-27T18:30:00Z',anomaly:false,tools:['openai','midjourney','perplexity'],usage:[{p:'openai',unit:'inr',used:5840},{p:'midjourney',unit:'images',used:42,limit:80,cost:1596},{p:'perplexity',unit:'inr',used:1840}]},
  {id:'e20',nm:'Aritra Chatterjee',email:'aritra.c@techcorp.in',av:'AC',team:'dat',role:'Analytics Engineer',cost:12510,last:'2026-07-28T08:30:00Z',anomaly:false,tools:['openai','gemini','mistral'],usage:[{p:'openai',unit:'inr',used:6120},{p:'gemini',unit:'inr',used:3490},{p:'mistral',unit:'inr',used:2900}]},
  {id:'e16',nm:'Priyanka Nair',email:'priyanka.nair@techcorp.in',av:'PN',team:'vid',role:'Multimedia Designer',cost:12253,last:'2026-07-27T14:00:00Z',anomaly:false,tools:['synthesia','firefly','midjourney'],usage:[{p:'synthesia',unit:'minutes',used:42,limit:60,cost:17640},{p:'firefly',unit:'credits',used:115,limit:200,cost:920},{p:'midjourney',unit:'images',used:0,limit:80,cost:0}]},
  {id:'e07',nm:'Sneha Joshi',email:'sneha.joshi@techcorp.in',av:'SJ',team:'eng',role:'QA Engineer',cost:11600,last:'2026-07-27T17:00:00Z',anomaly:false,tools:['perplexity','copilot','openai'],usage:[{p:'perplexity',unit:'inr',used:3200},{p:'copilot',unit:'seats',used:1,note:'Activity only'},{p:'openai',unit:'inr',used:8400}]},
  {id:'e09',nm:'Lakshmi Narayanan',email:'lakshmi.n@techcorp.in',av:'LN',team:'mkt',role:'Content Strategist',cost:9120,last:'2026-07-27T16:00:00Z',anomaly:false,tools:['openai','midjourney','elevenlabs'],usage:[{p:'openai',unit:'inr',used:4320},{p:'midjourney',unit:'images',used:38,limit:60,cost:1444},{p:'elevenlabs',unit:'characters',used:48000,limit:80000,cost:192}]},
  {id:'e05',nm:'Rohit Deshmukh',email:'rohit.deshmukh@techcorp.in',av:'RD',team:'eng',role:'Frontend Engineer',cost:8920,last:'2026-07-28T08:40:00Z',anomaly:false,tools:['copilot','gemini'],usage:[{p:'copilot',unit:'seats',used:1,note:'Activity only'},{p:'gemini',unit:'inr',used:8920}]},
  {id:'e21',nm:'Karan Mehra',email:'karan.mehra@techcorp.in',av:'KM',team:'ops',role:'Operations Manager',cost:5840,last:'2026-07-27T12:00:00Z',anomaly:false,tools:['openai','perplexity'],usage:[{p:'openai',unit:'inr',used:3840},{p:'perplexity',unit:'inr',used:2000}]},
  {id:'e10',nm:'Ananya Bhatia',email:'ananya.bhatia@techcorp.in',av:'AB',team:'mkt',role:'Growth Manager',cost:5290,last:'2026-07-26T15:00:00Z',anomaly:false,tools:['perplexity','firefly'],usage:[{p:'perplexity',unit:'inr',used:2490},{p:'firefly',unit:'credits',used:98,limit:200,cost:784}]},
  {id:'e11',nm:'Vikram Sethi',email:'vikram.sethi@techcorp.in',av:'VS',team:'mkt',role:'SEO Analyst',cost:5200,last:'2026-07-25T14:00:00Z',anomaly:false,tools:['perplexity','openai'],usage:[{p:'perplexity',unit:'inr',used:2700},{p:'openai',unit:'inr',used:2500}]},
  {id:'e22',nm:'Vishnu Pillai',email:'vishnu.pillai@techcorp.in',av:'VP',team:'ops',role:'HR Lead',cost:0,last:'2026-07-10T09:00:00Z',anomaly:false,tools:[],usage:[],note:'No usage recorded this billing cycle.'},
];

const monthlyTrend=[
  {m:'Feb',cost:212000},{m:'Mar',cost:241000},{m:'Apr',cost:268000},
  {m:'May',cost:289000},{m:'Jun',cost:298000},{m:'Jul',cost:339553,curr:true},
];

const alerts=[
  {id:'a1',type:'shadow',sev:'critical',title:'Unauthorized tool — Sora (OpenAI)',desc:'Rohan Chaudhary (Video Editing) is accessing Sora via an unapproved API key. Usage was detected via network log analysis on 26 Jul. This tool has not been vetted by security.',when:'2026-07-26T08:42:00Z',actions:['revoke']},
  {id:'a2',type:'spike',sev:'critical',title:'Karthik Subramaniam — cost spike +280%',desc:'OpenAI spend reached ₹19,840 in July, 280% above his 3-month average of ₹5,225. Peak usage on 24–27 Jul appears to be o1-preview model calls.',when:'2026-07-27T06:00:00Z',actions:['review']},
  {id:'a3',type:'budget',sev:'warning',title:'Video Editing team at 87% of July budget',desc:'Video Editing team has spent ₹1,04,383 of ₹1,20,000 budget with 3 days remaining. At current consumption rate, the team will exceed budget on 30 July.',when:'2026-07-28T00:00:00Z',actions:['adjust']},
];

// ============================================================
// HELPERS
// ============================================================
const provById=id=>providers.find(p=>p.id===id);
const teamNm=id=>({eng:'Engineering',mkt:'Marketing',vid:'Video Editing',dat:'Data & Analytics',ops:'Operations'}[id]||id);

function provMarkHTML(p,size=24){
  const pm=p||{abbr:'??',cat:'text'};
  return `<div class="pm pm-${pm.cat}" style="width:${size}px;height:${size}px;font-size:${Math.floor(size*.38)}px">${pm.abbr}</div>`;
}

function tierTagHTML(tier){
  const cls={live:'tag-live',activity:'tag-activity',manual:'tag-manual'};
  return `<span class="tag ${cls[tier]||'tag-manual'}">${TIERS[tier]||tier}</span>`;
}

function pbarHTML(pct,cls,h=8){
  const c=pct>=95?'pbar-danger':pct>=80?'pbar-warn':'pbar-safe';
  return `<div class="pbar" style="height:${h}px;width:100%"><div class="pbar-fill ${cls||c}" style="width:${Math.min(pct,100)}%"></div></div>`;
}

// ============================================================
// ROUTER
// ============================================================
let activeView='overview';
function navigate(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n=>{n.classList.remove('active');n.removeAttribute('aria-current')});
  const v=document.getElementById('view-'+id);
  const n=document.getElementById('ni-'+id);
  if(v)v.classList.add('active');
  if(n){n.classList.add('active');n.setAttribute('aria-current','page');}
  activeView=id;
  closeSidePanel();
}
document.querySelectorAll('[data-view]').forEach(el=>{
  el.addEventListener('click',e=>{e.stopPropagation();navigate(el.dataset.view);});
});

// ============================================================
// OVERVIEW: TREND CHART
// ============================================================
function renderTrendChart(){
  const el=document.getElementById('trend-chart');if(!el)return;
  const W=680,H=300,PL=52,PR=20,PT=24,PB=40;
  const cW=W-PL-PR,cH=H-PT-PB;
  const max=Math.max(...monthlyTrend.map(m=>m.cost));
  const barW=Math.floor(cW/monthlyTrend.length*0.54);
  const barGap=cW/monthlyTrend.length;
  const yTicks=[0,100000,200000,300000];
  let svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">`;
  yTicks.forEach(v=>{
    const y=PT+cH-(v/max)*cH;
    svg+=`<line x1="${PL}" x2="${W-PR}" y1="${y}" y2="${y}" stroke="#e0e0e0" stroke-width="${v===0?1:.5}"/>`;
    if(v>0)svg+=`<text x="${PL-8}" y="${y+4}" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="11" fill="#8d8d8d">₹${v/100000}L</text>`;
  });
  monthlyTrend.forEach((m,i)=>{
    const barH=(m.cost/max)*cH;
    const x=PL+i*barGap+(barGap-barW)/2;
    const y=PT+cH-barH;
    svg+=`<rect class="chart-bar-rect" data-month="${m.m}" data-cost="${m.cost}" data-idx="${i}" x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${m.curr?'#0f62fe':'#c6c6c6'}" style="cursor:pointer;transition:fill 0.15s"/>`;
    svg+=`<text x="${x+barW/2}" y="${H-PB+18}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="${m.curr?'#0f62fe':'#525252'}" font-weight="${m.curr?600:400}">${m.m}</text>`;
    if(m.curr){
      svg+=`<text x="${x+barW/2}" y="${y-8}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="#0f62fe" font-weight="600">₹${(m.cost/100000).toFixed(2)}L</text>`;
    }
  });
  svg+=`</svg>`;
  el.innerHTML=svg;

  // Chart Tooltip Hover Handlers
  let tooltip = document.getElementById('chart-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'chart-tooltip';
    document.body.appendChild(tooltip);
  }
  el.querySelectorAll('.chart-bar-rect').forEach(rect => {
    rect.addEventListener('mouseenter', (e) => {
      rect.setAttribute('fill', '#0043ce');
      const month = rect.getAttribute('data-month');
      const cost = parseInt(rect.getAttribute('data-cost'), 10);
      const details = [
        { name: 'OpenAI', cost: Math.round(cost * 0.42) },
        { name: 'Google Gemini', cost: Math.round(cost * 0.24) },
        { name: 'Anthropic', cost: Math.round(cost * 0.20) },
        { name: 'Others', cost: Math.round(cost * 0.14) }
      ];
      tooltip.innerHTML = `
        <div class="ct-m">${month} 2026 Spend</div>
        <div class="ct-tot">${fmtINR(cost)}</div>
        ${details.map(d => `<div class="ct-item"><span>${d.name}</span><span>${fmtINR(d.cost)}</span></div>`).join('')}
      `;
      tooltip.classList.add('show');
    });
    rect.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top = (e.clientY - 24) + 'px';
    });
    rect.addEventListener('mouseleave', () => {
      const idx = parseInt(rect.getAttribute('data-idx'), 10);
      const isCurr = monthlyTrend[idx]?.curr;
      rect.setAttribute('fill', isCurr ? '#0f62fe' : '#c6c6c6');
      tooltip.classList.remove('show');
    });
  });
}

// ============================================================
// OVERVIEW: TOP PROVIDERS
// ============================================================
function renderTopProviders(){
  const el=document.getElementById('top-prov-list');if(!el)return;
  const sorted=[...providers].sort((a,b)=>provCost(b)-provCost(a)).slice(0,6);
  el.innerHTML=sorted.map(p=>{
    const cost=provCost(p);
    const pct=Math.round((p.used/p.limit)*100);
    const est=p.unit!=='inr';
    const pctCls=pct>=95?'pbar-danger':pct>=80?'pbar-warn':'pbar-safe';
    return `<div class="ov-prov-item">
      ${provMarkHTML(p,24)}
      <div class="ov-prov-nm">
        <span class="ov-prov-name-text">${p.nm}</span>
        <div>${tierTagHTML(p.tier)}</div>
      </div>
      <div>${pbarHTML(pct,pctCls,6)}</div>
      <div>
        <div class="ov-prov-cost">${fmtINR(cost)}</div>
        ${est?`<div class="ov-prov-est">est.</div>`:''}
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// OVERVIEW: TEAM BUDGETS
// ============================================================
function renderOvTeams(){
  const el=document.getElementById('ov-teams');if(!el)return;
  el.innerHTML=teams.map(t=>{
    const pct=(t.spent/t.budget)*100;
    const cls=pct>=95?'pbar-danger':pct>=80?'pbar-warn':'pbar-safe';
    return `<div class="ov-team-item">
      <div class="ov-team-main-row">
        <div class="ov-team-nm">${t.nm}</div>
        <div>${pbarHTML(pct,cls,8)}</div>
        <div class="ov-team-cost">${fmtINR(t.spent)}</div>
      </div>
      <div class="ov-team-meta-row">
        <span class="ov-team-sub">${pct.toFixed(1)}% used</span>
        <span class="ov-team-sub">${fmtINR(t.budget-t.spent)} remaining</span>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// OVERVIEW: COVERAGE
// ============================================================
function renderOvCoverage(){
  const el=document.getElementById('ov-coverage');if(!el)return;
  const total=providers.length;
  const allCost=providers.reduce((a,p)=>a+provCost(p),0);
  const liveCost=providers.filter(p=>p.tier==='live').reduce((a,p)=>a+provCost(p),0);
  const cats=['live','activity','manual'];
  el.innerHTML=`
    <p style="font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:16px">Data precision varies by integration tier. <span class="tag tag-live" style="font-size:10px">Live API</span> providers give per-token cost data. Activity-only and manual-import providers are estimated.</p>
    ${cats.map(c=>{
      const n=providers.filter(p=>p.tier===c).length;
      return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="font-family:var(--mono);color:var(--t2);font-size:11px;min-width:100px">${TIERS[c]}</span>
        <div style="flex:1">${pbarHTML((n/total)*100,'pbar-blue',4)}</div>
        <span style="font-family:var(--mono);font-size:11px;color:var(--t2);min-width:32px;text-align:right">${n}/${total}</span>
      </div>`;
    }).join('')}
    <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--b1);display:flex;align-items:center;gap:8px">
      <span style="font-family:var(--mono);font-size:12px;color:var(--t2);flex:1">Exact cost data coverage</span>
      <span style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--blue)">${Math.round((liveCost/allCost)*100)}%</span>
    </div>
    <p style="font-size:11px;color:var(--t3);font-family:var(--mono);margin-top:4px">of total spend has per-token precision</p>`;
}

// ============================================================
// EMPLOYEES TABLE
// ============================================================
// EMPLOYEES TABLE
// ============================================================
let empTeamFilter='',empStatusFilter='',empSearchQuery='',selectedEmpId=null;

function renderEmployees(){
  const tbody=document.getElementById('emp-tbody');if(!tbody)return;
  let rows=[...employees];
  if(empTeamFilter)rows=rows.filter(e=>e.team===empTeamFilter);
  if(empStatusFilter==='anomaly')rows=rows.filter(e=>e.anomaly);
  if(empSearchQuery){
    const q=empSearchQuery.toLowerCase();
    rows=rows.filter(e=>e.nm.toLowerCase().includes(q)||e.email.toLowerCase().includes(q)||e.role.toLowerCase().includes(q));
  }
  rows.sort((a,b)=>b.cost-a.cost);
  tbody.innerHTML=rows.map(emp=>{
    const marks=emp.tools.slice(0,4).map(tid=>{
      const p=provById(tid);return p?provMarkHTML(p,20):'';
    }).join('');
    const extra=emp.tools.length>4?`<span style="font-size:10px;color:var(--t2);font-family:var(--mono);padding:0 3px;align-self:center">+${emp.tools.length-4}</span>`:'';
    const statusHTML=emp.shadowAI
      ?`<span class="tag tag-err">Shadow AI</span>`
      :emp.anomaly?`<span class="tag tag-err">Anomaly</span>`
      :emp.cost===0?`<span class="tag tag-manual">No activity</span>`
      :`<span class="tag tag-ok">Active</span>`;
    const spendDisplay=emp.cost===0?`<span style="color:var(--t3);font-family:var(--mono)">—</span>`:`<span class="td-mono">${fmtINR(emp.cost)}</span>`;
    return `<tr class="${emp.anomaly?'err-row':''}${emp.id===selectedEmpId?' sel':''}" data-emp="${emp.id}" tabindex="0" role="row">
      <td><div class="td-emp">
        <div class="emp-av${emp.anomaly?' emp-av-err':''}">${emp.av}</div>
        <div><span class="emp-nm">${emp.nm}</span><span class="emp-em">${emp.email}</span></div>
      </div></td>
      <td><span style="font-size:13px;font-weight:500">${teamNm(emp.team)}</span><div style="font-size:11px;color:var(--t2);font-family:var(--mono)">${emp.role}</div></td>
      <td><div class="marks-row" style="display:flex;align-items:center;gap:3px">${marks}${extra}</div></td>
      <td class="ra">${spendDisplay}</td>
      <td class="ra"><span style="font-size:12px;color:var(--t2);font-family:var(--mono)">${timeAgo(emp.last)}</span></td>
      <td>${statusHTML}</td>
      <td><button class="btn btn-ghost btn-sm" data-drill="${emp.id}">Details →</button></td>
    </tr>`;
  }).join('');
  const cnt=document.getElementById('emp-fbar-count');
  if(cnt)cnt.textContent=`${rows.length} employee${rows.length!==1?'s':''}`;
  const sub=document.getElementById('emp-sub');
  if(sub)sub.textContent=`${rows.length} shown · ${employees.filter(e=>e.anomaly).length} anomalies`;
  
  // Stat strip updates
  const totalCost=rows.reduce((sum,e)=>sum+e.cost,0);
  const totalAnomalies=rows.filter(e=>e.anomaly||e.shadowAI).length;
  const statTot=document.getElementById('emp-stat-total');if(statTot)statTot.textContent=rows.length;
  const statSp=document.getElementById('emp-stat-spend');if(statSp)statSp.textContent=fmtINR(totalCost);
  const statAnom=document.getElementById('emp-stat-anomalies');if(statAnom)statAnom.textContent=`${totalAnomalies} flagged`;

  tbody.querySelectorAll('tr[data-emp]').forEach(row=>{
    row.addEventListener('click',()=>openSidePanel(row.dataset.emp));
    row.addEventListener('keydown',e=>{if(e.key==='Enter')openSidePanel(row.dataset.emp);});
  });
}

document.getElementById('emp-filter-team')?.addEventListener('change',e=>{empTeamFilter=e.target.value;renderEmployees();});
document.getElementById('emp-filter-status')?.addEventListener('change',e=>{empStatusFilter=e.target.value;renderEmployees();});
document.getElementById('emp-search')?.addEventListener('input',e=>{empSearchQuery=e.target.value;renderEmployees();});

// ============================================================
// EMPLOYEE SIDE PANEL
// ============================================================
function openSidePanel(empId){
  selectedEmpId=empId;
  const emp=employees.find(e=>e.id===empId);if(!emp)return;
  const panel=document.getElementById('emp-panel');
  document.getElementById('sp-av').textContent=emp.av;
  document.getElementById('sp-av').className='sp-av'+(emp.anomaly?' sp-av-err':'');
  document.getElementById('sp-name').textContent=emp.nm;
  document.getElementById('sp-meta').textContent=`${emp.role} · ${teamNm(emp.team)}`;
  const usageHTML=emp.usage.length===0
    ?`<div style="padding:20px 0;text-align:center;font-size:13px;color:var(--t2)">${emp.note||'No usage recorded this billing cycle.'}</div>`
    :emp.usage.map(u=>{
      const p=provById(u.p);
      if(!p&&!u.nm)return '';
      const nm=u.nm||(p?p.nm:'');
      const pct=u.limit?Math.round((u.used/u.limit)*100):null;
      const cls=pct!=null?(pct>=95?'pbar-danger':pct>=80?'pbar-warn':'pbar-safe'):'pbar-blue';
      const costVal=u.cost!=null?fmtINR(u.cost):(u.unit==='inr'?fmtINR(u.used):null);
      return `<div class="sp-usage-item">
        ${p?provMarkHTML(p,20):`<div class="pm pm-text" style="width:20px;height:20px;font-size:8px;background:var(--red-lt);border-color:var(--red);color:var(--red)">⚠</div>`}
        <div class="sp-usage-info">
          <div class="sp-usage-nm">${nm}${u.shadow?`<span class="tag tag-err" style="font-size:10px">Unauthorized</span>`:''}</div>
          ${pct!=null?`<div class="sp-usage-bar-row">
            <div class="pbar sp-usage-bar" style="height:6px;flex:1"><div class="pbar-fill ${cls}" style="width:${Math.min(pct,100)}%"></div></div>
            <span class="sp-usage-credit">${fmtCredit(u.used,u.unit)} / ${fmtCredit(u.limit,u.unit)}</span>
          </div>`
          :u.note?`<div class="sp-usage-credit" style="font-style:italic;color:var(--t3)">${u.note}</div>`
          :u.unit!=='inr'?`<div class="sp-usage-credit">${fmtCredit(u.used,u.unit)}</div>`:''}
          <div class="sp-usage-time">${timeAgo(emp.last)}</div>
        </div>
        <div class="sp-usage-cost">
          ${u.shadow?`<div class="sp-usage-cost-note" style="color:var(--red)">Unapproved</div>`
            :costVal?`<div class="sp-usage-cost-val">${costVal}</div>`
            :`<div class="sp-usage-cost-note">est.</div>`}
        </div>
      </div>`;
    }).join('');
  document.getElementById('sp-body').innerHTML=`
    ${emp.anomaly?`<div class="notif notif-error" style="margin:0 0 12px"><span class="notif-icon notif-icon-error">◬</span><div class="notif-bd"><div class="notif-desc">${emp.anomalyReason}</div></div></div>`:''}
    <div class="sp-stat-grid">
      <div class="sp-stat"><div class="sp-stat-lbl">Jul spend</div><div class="sp-stat-val" style="${emp.cost>20000?'color:var(--red)':''}">${emp.cost===0?'₹ —':fmtINR(emp.cost)}</div></div>
      <div class="sp-stat"><div class="sp-stat-lbl">Providers</div><div class="sp-stat-val">${emp.tools.length}</div></div>
    </div>
    <div class="sp-sec">Usage breakdown</div>
    ${usageHTML}`;
  panel.classList.add('open');
  renderEmployees();
}

function closeSidePanel(){
  selectedEmpId=null;
  document.getElementById('emp-panel').classList.remove('open');
  renderEmployees();
}
document.getElementById('sp-close').addEventListener('click',closeSidePanel);

// ============================================================
// PROVIDERS LIST
// ============================================================
let provCatFilter='all';

function renderProviders(){
  const el=document.getElementById('prov-list');if(!el)return;
  let list=[...providers];
  if(provCatFilter!=='all')list=list.filter(p=>p.cat===provCatFilter||(provCatFilter==='text'&&p.cat==='code'));
  const allCost=list.reduce((a,p)=>a+provCost(p),0);
  el.innerHTML=list.map(p=>{
    const cost=provCost(p);
    const pct=Math.round((p.used/p.limit)*100);
    const cls=pct>=95?'pbar-danger':pct>=80?'pbar-warn':'pbar-safe';
    const est=p.unit!=='inr';
    return `<div class="prov-row" data-pid="${p.id}">
      <div>${provMarkHTML(p,24)}</div>
      <div class="prov-row-name">
        <strong>${p.nm}</strong>
      </div>
      <div>${tierTagHTML(p.tier)}</div>
      <div class="prov-bar-cell">
        <div class="pbar" style="height:10px;width:100%"><div class="pbar-fill ${cls}" style="width:${Math.min(pct,100)}%"></div></div>
        <div class="prov-credit">${fmtCredit(p.used,p.unit)} <span style="color:var(--t3)">of</span> ${fmtCredit(p.limit,p.unit)}</div>
      </div>
      <div>
        <div class="prov-pct" style="${pct>=80?'color:var(--red)':pct>=60?'color:#996500':''}">${pct}%</div>
      </div>
      <div>
        <div class="prov-inr">${fmtINR(cost)}</div>
        ${est?`<div class="prov-inr-note">est. · ${((cost/allCost)*100).toFixed(1)}%</div>`
             :`<div class="prov-inr-note">${((cost/allCost)*100).toFixed(1)}%</div>`}
      </div>
      <div><button class="btn btn-ghost btn-sm">Manage</button></div>
    </div>`;
  }).join('');
}

document.querySelectorAll('.prov-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.prov-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    provCatFilter=tab.dataset.cat;
    renderProviders();
  });
});

// ============================================================
// ADD INTEGRATION FLOW
// ============================================================
const intProviders=[
  {id:'openai',nm:'OpenAI',cat:'text',tier:'live',method:'apikey',desc:'API key — per-token cost data, exact ₹ attribution per employee'},
  {id:'anthropic',nm:'Anthropic Claude',cat:'text',tier:'live',method:'apikey',desc:'API key — per-token cost data'},
  {id:'gemini',nm:'Google Gemini',cat:'text',tier:'live',method:'apikey',desc:'API key — per-token cost data'},
  {id:'mistral',nm:'Mistral AI',cat:'text',tier:'live',method:'apikey',desc:'API key — per-token cost data'},
  {id:'cohere',nm:'Cohere',cat:'text',tier:'live',method:'apikey',desc:'API key — per-token cost data'},
  {id:'copilot',nm:'GitHub Copilot',cat:'code',tier:'activity',method:'oauth',desc:'OAuth — seat and session activity data'},
  {id:'chatgpt-team',nm:'ChatGPT Team',cat:'text',tier:'activity',method:'oauth',desc:'OAuth — session data, no per-message breakdown'},
  {id:'perplexity',nm:'Perplexity Pro',cat:'text',tier:'manual',method:'csv',desc:'CSV import — monthly totals only'},
  {id:'higgsfield',nm:'Higgsfield',cat:'video',tier:'live',method:'apikey',desc:'API key — per-render credit tracking',unit:'renders'},
  {id:'runway',nm:'Runway ML',cat:'video',tier:'live',method:'apikey',desc:'API key — per-credit data',unit:'credits'},
  {id:'pika',nm:'Pika Labs',cat:'video',tier:'activity',method:'oauth',desc:'OAuth — activity and credit estimate only'},
  {id:'kling',nm:'Kling AI',cat:'video',tier:'manual',method:'csv',desc:'CSV import — monthly render counts'},
  {id:'luma',nm:'Luma Dream Machine',cat:'video',tier:'activity',method:'oauth',desc:'OAuth — generation count only'},
  {id:'synthesia',nm:'Synthesia',cat:'video',tier:'manual',method:'csv',desc:'CSV import — monthly video minutes'},
  {id:'elevenlabs',nm:'ElevenLabs',cat:'voice',tier:'live',method:'apikey',desc:'API key — per-character cost data'},
  {id:'midjourney',nm:'Midjourney',cat:'image',tier:'manual',method:'csv',desc:'CSV import — monthly totals'},
  {id:'firefly',nm:'Adobe Firefly',cat:'image',tier:'activity',method:'oauth',desc:'OAuth — credit count only'},
];
const willGet={
  live:['Per-user credit and token usage','Real-time cost attribution in ₹','Model or render-type breakdown','Exact cost per employee'],
  activity:['Session counts per employee','Last-active timestamps','Seat utilisation rate','Estimated cost based on seat/tier price'],
  manual:['Monthly org-wide totals from CSV','Imported after each billing cycle'],
};
const wontGet={
  live:[],
  activity:['Token-level or per-generation detail','Exact ₹ cost — seat estimate only'],
  manual:['Real-time data','Per-employee breakdown','Token or render counts'],
};

let selIntProv=null,intStep=1;

function renderIntProvGroups(filter=''){
  const el=document.getElementById('int-prov-groups');if(!el)return;
  const cats=['text','code','video','voice','image'];
  const catLabels={text:'Text & Code',code:'Code',video:'Video Generation',voice:'Voice / Audio',image:'Image'};
  let html='';
  cats.forEach(cat=>{
    const list=intProviders.filter(p=>p.cat===cat&&(!filter||p.nm.toLowerCase().includes(filter.toLowerCase())));
    if(!list.length)return;
    html+=`<div class="int-cat-grp"><div class="int-cat-lbl">${catLabels[cat]}</div>`;
    list.forEach(p=>{
      const matchProv=providers.find(pp=>pp.id===p.id);
      const abbr=matchProv?matchProv.abbr:(()=>{const parts=p.nm.split(' ');return parts.length>1?parts.map(w=>w[0]).join('').slice(0,2).toUpperCase():p.nm.slice(0,2).toUpperCase();})();
      html+=`<button class="int-prov-item${selIntProv?.id===p.id?' sel':''}" data-pid="${p.id}">
        <div class="pm pm-${p.cat}" style="font-size:9px">${abbr}</div>
        <div class="int-prov-nm">${p.nm}</div>
        <div style="text-align:right">
          <div class="int-prov-sub">${p.desc}</div>
          <div style="margin-top:3px">${tierTagHTML(p.tier)}</div>
        </div>
      </button>`;
    });
    html+='</div>';
  });
  el.innerHTML=html||`<div style="padding:24px;text-align:center;font-size:13px;color:var(--t2)">No providers match "${filter}".</div>`;
  el.querySelectorAll('.int-prov-item').forEach(btn=>{
    btn.addEventListener('click',()=>{
      selIntProv=intProviders.find(p=>p.id===btn.dataset.pid);
      renderIntProvGroups(document.getElementById('int-search-inp')?.value||'');
      goIntStep(2);
    });
  });
}

document.getElementById('int-search-inp')?.addEventListener('input',e=>renderIntProvGroups(e.target.value));

function goIntStep(n){
  intStep=n;
  ['int-s1','int-s2','int-s3','int-s4'].forEach((id,i)=>{
    document.getElementById(id)?.classList.toggle('gone',i+1!==n);
  });
  document.querySelectorAll('#int-prog .ps').forEach((el,i)=>{
    el.classList.remove('active','done');
    const circle=el.querySelector('.ps-circle');
    if(i+1<n){el.classList.add('done');if(circle)circle.textContent='✓';}
    else if(i+1===n){el.classList.add('active');if(circle)circle.textContent=i+1;}
    else{if(circle)circle.textContent=i+1;}
  });
  if(n===2&&selIntProv)renderConnectForm();
  if(n===4)startVerify();
}

function renderConnectForm(){
  const f=document.getElementById('int-connect-form');
  const title=document.getElementById('int-s2-title');
  const desc=document.getElementById('int-s2-desc');
  const disc=document.getElementById('int-data-disclosure');
  if(!f||!selIntProv)return;
  title.textContent=`Connect ${selIntProv.nm}`;
  desc.textContent=selIntProv.method==='apikey'
    ?`Enter your ${selIntProv.nm} API key. Vantage reads usage data only — it never accesses prompt content or model outputs.`
    :selIntProv.method==='oauth'?`Authorise Vantage to read session and usage data from ${selIntProv.nm}. No message content is accessed.`
    :`Upload your ${selIntProv.nm} monthly usage CSV.`;
  if(selIntProv.method==='apikey'){
    f.innerHTML=`
      <div class="ff"><label class="ff-lbl" for="api-key-inp">API key</label><input type="password" id="api-key-inp" class="ff-in mono" placeholder="Paste API key…" autocomplete="off"/><div class="ff-hint">Stored encrypted with AES-256. Used only to call the usage/billing API endpoint.</div></div>
      <div class="ff"><label class="ff-lbl" for="org-id-inp">Organisation ID (optional)</label><input type="text" id="org-id-inp" class="ff-in mono" placeholder="e.g. org-…"/></div>
      <button class="btn btn-primary" id="int-btn-s2">Verify connection →</button>`;
  } else if(selIntProv.method==='oauth'){
    f.innerHTML=`
      <p style="font-size:13px;color:var(--t2);margin-bottom:16px;line-height:1.6">Authorise Vantage to read seat and activity data. You'll be redirected to ${selIntProv.nm} to approve read-only access.</p>
      <button class="btn btn-primary" id="int-btn-s2">↗ Authorise with ${selIntProv.nm}</button>`;
  } else {
    f.innerHTML=`
      <div class="ff"><label class="ff-lbl" for="csv-upload">Usage CSV</label><input type="file" id="csv-upload" class="ff-in" accept=".csv"/><div class="ff-hint">Export from ${selIntProv.nm} → Settings → Usage → Download CSV.</div></div>
      <button class="btn btn-primary" id="int-btn-s2">Parse and import →</button>`;
  }
  f.querySelector('#int-btn-s2')?.addEventListener('click',()=>goIntStep(3));
  disc.innerHTML=`
    <div class="data-will"><div class="data-will-title">What Vantage will track</div><ul class="data-ul will">${willGet[selIntProv.tier].map(i=>`<li>${i}</li>`).join('')}</ul></div>
    ${wontGet[selIntProv.tier].length?`<div class="data-wont"><div class="data-wont-title">What Vantage cannot track</div><ul class="data-ul wont">${wontGet[selIntProv.tier].map(i=>`<li>${i}</li>`).join('')}</ul></div>`:''}`;
}

function startVerify(){
  const sp=document.getElementById('int-spinner');
  const ok=document.getElementById('int-ok');
  const msg=document.getElementById('int-verify-msg');
  const pname=document.getElementById('int-verify-provider');
  const finalName=document.getElementById('int-final-name');
  if(pname&&selIntProv)pname.textContent=selIntProv.nm;
  if(finalName&&selIntProv)finalName.value=selIntProv.nm;
  if(!sp||!ok)return;
  sp.classList.remove('hidden');ok.classList.add('hidden');
  if(msg)msg.textContent=`Testing connection to ${selIntProv?.nm||'provider'}…`;
  setTimeout(()=>{
    sp.classList.add('hidden');ok.classList.remove('hidden');
    if(msg)msg.textContent='Connection verified successfully.';
  },1800);
}

document.getElementById('int-back-1')?.addEventListener('click',()=>goIntStep(1));
document.getElementById('int-back-2')?.addEventListener('click',()=>goIntStep(2));
document.getElementById('int-back-3')?.addEventListener('click',()=>goIntStep(3));
document.getElementById('int-btn-s3')?.addEventListener('click',()=>goIntStep(4));
document.getElementById('int-btn-activate')?.addEventListener('click',()=>{navigate('providers');goIntStep(1);selIntProv=null;renderIntProvGroups();});
document.getElementById('btn-manual-fallback')?.addEventListener('click',()=>{selIntProv=intProviders.find(p=>p.method==='csv');if(selIntProv)goIntStep(2);});

// ============================================================
// ADD EMPLOYEE FLOW
// ============================================================
let aeStep=1,aeData={name:'',email:'',team:'',role:'',manager:'',provAccess:[]};

function goAeStep(n){
  aeStep=n;
  ['ae-s1','ae-s2','ae-s3'].forEach((id,i)=>{
    document.getElementById(id)?.classList.toggle('gone',i+1!==n);
  });
  document.querySelectorAll('#emp-prog .ps').forEach((el,i)=>{
    el.classList.remove('active','done');
    const circle=el.querySelector('.ps-circle');
    if(i+1<n){el.classList.add('done');if(circle)circle.textContent='✓';}
    else if(i+1===n){el.classList.add('active');if(circle)circle.textContent=i+1;}
    else{if(circle)circle.textContent=i+1;}
  });
  if(n===2)renderAeProvAccess();
  if(n===3)renderAeReview();
}

function validateAeS1(){
  let ok=true;
  const name=document.getElementById('ae-name')?.value.trim();
  const email=document.getElementById('ae-email')?.value.trim();
  const team=document.getElementById('ae-team')?.value;
  const role=document.getElementById('ae-role')?.value.trim();
  const showErr=(id,show)=>{document.getElementById(id)?.classList.toggle('hidden',!show);document.getElementById(id.replace('-err',''))?.classList.toggle('err-inp',show);};
  showErr('ae-name-err',!name);if(!name)ok=false;
  showErr('ae-email-err',!email||!email.includes('@'));if(!email||!email.includes('@'))ok=false;
  showErr('ae-team-err',!team);if(!team)ok=false;
  showErr('ae-role-err',!role);if(!role)ok=false;
  if(ok){aeData.name=name;aeData.email=email;aeData.team=team;aeData.role=role;aeData.manager=document.getElementById('ae-manager')?.value.trim();}
  return ok;
}

document.getElementById('ae-btn-s1')?.addEventListener('click',()=>{if(validateAeS1())goAeStep(2);});
document.getElementById('ae-back-1')?.addEventListener('click',()=>goAeStep(1));
document.getElementById('ae-btn-s2')?.addEventListener('click',()=>{collectAeProvAccess();goAeStep(3);});
document.getElementById('ae-back-2')?.addEventListener('click',()=>goAeStep(2));
document.getElementById('ae-btn-create')?.addEventListener('click',()=>{navigate('employees');goAeStep(1);aeData={name:'',email:'',team:'',role:'',manager:'',provAccess:[]};});

const teamDefaultProvs={
  eng:['openai','anthropic','copilot','gemini'],
  mkt:['openai','perplexity','midjourney'],
  vid:['higgsfield','runway','elevenlabs','firefly'],
  dat:['openai','anthropic','gemini'],
  ops:['openai','perplexity'],
};

function renderAeProvAccess(){
  const el=document.getElementById('ae-prov-groups');if(!el)return;
  const defaults=teamDefaultProvs[aeData.team]||[];
  const cats=['text','code','video','voice','image'];
  const catLabels={text:'Text & Code',code:'Code',video:'Video Generation',voice:'Voice / Audio',image:'Image'};
  let html='';
  cats.forEach(cat=>{
    const list=providers.filter(p=>p.cat===cat);
    if(!list.length)return;
    html+=`<div style="margin-bottom:20px"><div class="int-cat-lbl">${catLabels[cat]}</div><div class="prov-ck-list">`;
    list.forEach(p=>{
      const checked=defaults.includes(p.id)||aeData.provAccess.find(a=>a.id===p.id);
      const saved=aeData.provAccess.find(a=>a.id===p.id);
      html+=`<div class="prov-ck-box">
        <label class="prov-ck-row">
          <input type="checkbox" class="ae-prov-ck" data-pid="${p.id}" ${checked?'checked':''}/>
          <div class="pm pm-${p.cat}" style="font-size:9px">${p.abbr}</div>
          <div><div class="prov-ck-lbl">${p.nm}</div><div class="prov-ck-sub">${tierTagHTML(p.tier)}</div></div>
        </label>
        <div class="prov-ck-limit${checked?' vis':''}" id="ae-limit-${p.id}">
          <label class="ff-lbl" for="ae-lim-${p.id}">Individual limit (${p.unit==='inr'?'₹':p.unit}) — blank for team allocation</label>
          <input type="number" id="ae-lim-${p.id}" class="ff-in mono" placeholder="No individual cap" value="${saved?.limit||''}" style="width:240px"/>
        </div>
      </div>`;
    });
    html+='</div></div>';
  });
  el.innerHTML=html;
  el.querySelectorAll('.ae-prov-ck').forEach(ck=>{
    ck.addEventListener('change',()=>{
      document.getElementById('ae-limit-'+ck.dataset.pid)?.classList.toggle('vis',ck.checked);
    });
  });
}

function collectAeProvAccess(){
  aeData.provAccess=[];
  document.querySelectorAll('.ae-prov-ck:checked').forEach(ck=>{
    const p=providers.find(pp=>pp.id===ck.dataset.pid);
    const lim=document.getElementById('ae-lim-'+ck.dataset.pid)?.value;
    aeData.provAccess.push({id:ck.dataset.pid,nm:p?.nm,unit:p?.unit,limit:lim||null});
  });
}

function renderAeReview(){
  const el=document.getElementById('ae-review');if(!el)return;
  const provList=aeData.provAccess.length
    ?aeData.provAccess.map(a=>`${a.nm}${a.limit?` (${a.unit==='inr'?fmtINR(parseFloat(a.limit)):a.limit+' '+a.unit} cap)`:''}`).join(', ')
    :'No providers assigned';
  el.innerHTML=`
    <div class="review-item"><div class="review-lbl">Full name</div><div class="review-val">${aeData.name}</div></div>
    <div class="review-item"><div class="review-lbl">Work email</div><div class="review-val mono" style="font-size:13px">${aeData.email}</div></div>
    <div class="review-item"><div class="review-lbl">Team</div><div class="review-val">${teamNm(aeData.team)}</div></div>
    <div class="review-item"><div class="review-lbl">Role</div><div class="review-val">${aeData.role}</div></div>
    ${aeData.manager?`<div class="review-item"><div class="review-lbl">Reports to</div><div class="review-val">${aeData.manager}</div></div>`:''}
    <div class="review-item"><div class="review-lbl">Providers (${aeData.provAccess.length})</div><div class="review-val" style="font-size:13px;line-height:1.5">${provList}</div></div>`;
}

// ============================================================
// BUDGETS & ALERTS
// ============================================================
function renderBudgets(){
  const el=document.getElementById('ba-budgets');if(!el)return;
  el.innerHTML=teams.map(t=>{
    const pct=(t.spent/t.budget)*100;
    const barCls=pct>=95?'pbar-danger':pct>=80?'pbar-warn':'pbar-safe';
    return `<div class="budget-item">
      <div><div class="budget-team">${t.nm}</div><div class="budget-lead">Lead: ${t.lead}</div></div>
      <div>
        <div class="budget-bar">${pbarHTML(pct,barCls,8)}</div>
        <div class="budget-meta"><span>${pct.toFixed(1)}% spent</span><span>${fmtINR(t.budget-t.spent)} remaining</span></div>
      </div>
      <div class="budget-val">
        <div class="budget-spent">${fmtINR(t.spent)}</div>
        <div class="budget-limit">of ${fmtINR(t.budget)}</div>
      </div>
    </div>`;
  }).join('');
}

function renderAlerts(){
  const el=document.getElementById('ba-alerts');if(!el)return;
  el.innerHTML=alerts.map(a=>{
    const cls=a.sev==='critical'?'ai-icon-err':'ai-icon-warn';
    const tcls=a.sev==='critical'?'ai-title-err':'ai-title-warn';
    const icon=a.sev==='critical'?'◬':'⚠';
    return `<div class="alert-item">
      <div class="ai-icon ${cls}">${icon}</div>
      <div class="ai-bd">
        <div class="ai-title ${tcls}">${a.title}</div>
        <div class="ai-desc">${a.desc}</div>
        <div class="ai-meta">${timeAgo(a.when)}</div>
      </div>
      <div class="ai-acts">
        <button class="btn btn-secondary btn-sm btn-dismiss-alert">Dismiss</button>
        ${a.actions.includes('revoke')?`<button class="btn btn-primary btn-danger btn-sm">Revoke Key</button>`:''}
        ${a.actions.includes('review')?`<button class="btn btn-primary btn-sm">Review Logs</button>`:''}
        ${a.actions.includes('adjust')?`<button class="btn btn-primary btn-sm">Adjust Limit</button>`:''}
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// EXPORT CSV REPORT
// ============================================================
function exportCSVReport(){
  let csv='Employee Name,Email,Team,Role,July Spend (INR),Last Activity,Status\n';
  employees.forEach(e=>{
    const status=e.shadowAI?'Shadow AI':e.anomaly?'Anomaly':e.cost===0?'Inactive':'Active';
    csv+=`"${e.nm}","${e.email}","${teamNm(e.team)}","${e.role}",${e.cost},"${e.last||''}",${status}\n`;
  });
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.setAttribute('href',url);
  link.setAttribute('download',`vantage_ai_spend_report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("CSV report downloaded", "success");
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = "success") {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.innerHTML = `<span>${type==='success'?'✓':type==='error'?'⚠':'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ============================================================
// GLOBAL DOM CLICKS
// ============================================================
document.addEventListener('click', (e) => {
  const target = e.target;
  
  // Drill down from Employees Table button
  if (target.dataset.drill) {
    e.preventDefault();
    e.stopPropagation();
    openSidePanel(target.dataset.drill);
  }
  
  // Export CSV Report Click
  if (target.id === 'btn-export-csv') {
    e.preventDefault();
    exportCSVReport();
  }
  
  // Dismiss Alerts Click
  if (target.classList.contains('btn-dismiss-alert') || target.closest('.btn-dismiss-alert')) {
    const alertEl = target.closest('.alert-item');
    if (alertEl) {
      alertEl.style.opacity = '0';
      alertEl.style.transition = 'opacity 0.25s ease';
      setTimeout(() => alertEl.remove(), 250);
    }
    showToast("Alert dismissed", "info");
  }
});

// ============================================================
// CANVAS SCROLL HERO ENGINE (192 FRAMES SEQUENCE)
// ============================================================
(function initCanvasHeroEngine() {
  const TOTAL_FRAMES = 192;
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const loaderEl = document.getElementById('hero-loader');
  const loaderFill = document.getElementById('hero-loader-fill');
  const loaderText = document.getElementById('hero-loader-text');
  const frameTextEl = document.getElementById('hero-frame-text');
  const container = document.getElementById('hero-scroll-sec');

  const stage1 = document.getElementById('hero-stage-1');
  const stage2 = document.getElementById('hero-stage-2');
  const stage3 = document.getElementById('hero-stage-3');
  const stage4 = document.getElementById('hero-stage-4');

  const frames = [];
  let loadedCount = 0;
  let currentFrameIndex = 0;
  let animationFrameId = null;

  function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  // Preload images asynchronously
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const frameNum = pad(i, 3);
    const primarySrc = `public/images sequence -jpg/ezgif-frame-${frameNum}.jpg`;
    const fallbackSrc = `images sequence -jpg/ezgif-frame-${frameNum}.jpg`;

    img.src = primarySrc;
    img.onload = () => {
      loadedCount++;
      const pct = Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100));
      if (loaderFill) loaderFill.style.width = pct + '%';
      if (loaderText) loaderText.textContent = `INITIALIZING TELEMETRY ENGINE... [${pct}%]`;
      
      // Render Frame 0 as soon as available
      if (i === 1) {
        renderFrame(0);
      }
      
      if (loadedCount >= TOTAL_FRAMES) {
        setTimeout(() => {
          if (loaderEl) loaderEl.classList.add('hidden-overlay');
        }, 200);
      }
    };
    img.onerror = () => {
      if (img.src.includes('public/')) {
        img.src = fallbackSrc;
      } else {
        loadedCount++;
      }
    };
    frames.push(img);
  }

  // Responsive object-fit: cover drawing
  function renderFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const cWidth = rect.width;
    const cHeight = rect.height;
    const iWidth = img.naturalWidth;
    const iHeight = img.naturalHeight;

    const scale = Math.max(cWidth / iWidth, cHeight / iHeight);
    const x = (cWidth - iWidth * scale) / 2;
    const y = (cHeight - iHeight * scale) / 2;

    ctx.clearRect(0, 0, cWidth, cHeight);
    ctx.drawImage(img, x, y, iWidth * scale, iHeight * scale);
    ctx.restore();
  }

  // Scroll listener & threshold mapping
  function updateScroll() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    
    if (scrollableDistance <= 0) return;

    // Calculate progress 0 to 1
    const rawProgress = (-rect.top) / scrollableDistance;
    const progress = Math.max(0, Math.min(1, rawProgress));

    const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
    
    if (targetFrame !== currentFrameIndex) {
      currentFrameIndex = targetFrame;
      renderFrame(currentFrameIndex);
      if (frameTextEl) {
        frameTextEl.textContent = `FRAME ${pad(currentFrameIndex + 1, 3)} / 192 • TELEMETRY ENGINE`;
      }
    }

    // Stage threshold transitions (0-191 total frames)
    if (stage1) stage1.classList.toggle('stage-active', currentFrameIndex <= 50);
    if (stage2) stage2.classList.toggle('stage-active', currentFrameIndex > 50 && currentFrameIndex <= 110);
    if (stage3) stage3.classList.toggle('stage-active', currentFrameIndex > 110 && currentFrameIndex <= 160);
    if (stage4) stage4.classList.toggle('stage-active', currentFrameIndex > 160);
  }

  function onScroll() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(() => {
        updateScroll();
        animationFrameId = null;
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => renderFrame(currentFrameIndex), { passive: true });
  updateScroll();
})();

// ============================================================
// INIT
// ============================================================
renderTrendChart();
renderTopProviders();
renderOvTeams();
renderOvCoverage();
renderEmployees();
renderProviders();
renderIntProvGroups();
renderBudgets();
renderAlerts();
