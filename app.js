import { tools, teams, employees, monthlyTrend, budgetAlerts, INTEGRATION_TIERS } from './data/mockData.js';

// ============================================================
// ROUTER — single-page navigation
// ============================================================

const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');

function navigate(viewId) {
  views.forEach(v => v.classList.remove('active'));
  navItems.forEach(n => {
    n.classList.remove('active');
    n.removeAttribute('aria-current');
  });

  const target = document.getElementById(`view-${viewId}`);
  const navTarget = document.getElementById(`nav-${viewId}`);

  if (target) target.classList.add('active');
  if (navTarget) {
    navTarget.classList.add('active');
    navTarget.setAttribute('aria-current', 'page');
  }
}

// Wire all nav links
navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigate(item.dataset.view);
  });
});

// Wire data-view buttons/links across the page
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-view]');
  if (trigger && !trigger.classList.contains('nav-item')) {
    e.preventDefault();
    navigate(trigger.dataset.view);
  }
});

// ============================================================
// HELPERS
// ============================================================

function fmt$(n, decimals = 0) {
  if (n === null || n === undefined) return null;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtK(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  return d + 'd ago';
}

function getTierClass(tier) {
  const map = { live: 'tier-live', activity: 'tier-activity', manual: 'tier-manual' };
  return map[tier] || 'tier-manual';
}

function getTierStripeClass(tier) {
  return `tool-tier-stripe--${tier}`;
}

function toolById(id) {
  return tools.find(t => t.id === id);
}

function effectiveCost(tool) {
  if (tool.monthlyCost !== null) return tool.monthlyCost;
  if (tool.costEstimate !== null) return tool.costEstimate;
  return 0;
}

// ============================================================
// OVERVIEW — TREND CHART
// ============================================================

function renderTrendChart() {
  const container = document.getElementById('trend-chart');
  if (!container) return;

  const max = Math.max(...monthlyTrend.map(m => m.cost));

  container.innerHTML = monthlyTrend.map(m => {
    const pct = (m.cost / max) * 100;
    const isCurrent = m.current;
    return `
      <div class="chart-bar-group">
        <span class="chart-value">${fmt$(m.cost)}</span>
        <div class="chart-bar${isCurrent ? ' current' : ''}" style="height:${pct}%" title="${m.month}: ${fmt$(m.cost)}"></div>
        <span class="chart-label">${m.month}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// OVERVIEW — TOP TOOLS LIST
// ============================================================

function renderTopTools() {
  const container = document.getElementById('top-tools-list');
  if (!container) return;

  const sorted = [...tools]
    .filter(t => !t.shadowAI)
    .sort((a, b) => effectiveCost(b) - effectiveCost(a))
    .slice(0, 5);

  const max = effectiveCost(sorted[0]);

  container.innerHTML = sorted.map(t => {
    const cost = effectiveCost(t);
    const pct = (cost / max) * 100;
    const isEstimate = t.monthlyCost === null;
    const tierClass = getTierStripeClass(t.tier);

    return `
      <div class="tool-spend-item">
        <div class="tool-tier-stripe ${tierClass}"></div>
        <div>
          <div class="tool-spend-name">${t.name}</div>
          <div class="tool-spend-tier">${INTEGRATION_TIERS[t.tier].label}</div>
        </div>
        <div class="tool-spend-bar-wrap" style="width:80px">
          <div class="tool-spend-bar"><div class="tool-spend-bar-fill" style="width:${pct}%"></div></div>
        </div>
        <div>
          <div class="tool-spend-cost">${fmt$(cost, isEstimate ? 0 : 2)}</div>
          ${isEstimate ? '<div style="font-family:var(--font-mono);font-size:10px;color:var(--warning);text-align:right">est.</div>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// OVERVIEW — TEAM BUDGETS
// ============================================================

function renderTeamBudgets(containerId = 'team-budget-list') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = teams.map(t => {
    const pct = (t.spent / t.budget) * 100;
    const cls = pct >= 95 ? 'danger' : pct >= 80 ? 'warning' : 'safe';
    const remaining = t.budget - t.spent;

    return `
      <div class="team-budget-item">
        <div>
          <div class="team-budget-name">${t.name}</div>
          <div class="team-budget-bar"><div class="team-budget-bar-fill ${cls}" style="width:${Math.min(pct,100)}%"></div></div>
          <div class="team-budget-sub">${pct.toFixed(1)}% of ${fmt$(t.budget)} budget</div>
        </div>
        <div class="team-budget-values">
          <div class="team-budget-spent">${fmt$(t.spent)}</div>
          <div class="team-budget-total">${fmt$(remaining)} left</div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// OVERVIEW — DATA COVERAGE
// ============================================================

function renderCoverageBreakdown() {
  const container = document.getElementById('coverage-breakdown');
  if (!container) return;

  const total = tools.length;
  const live = tools.filter(t => t.tier === 'live').length;
  const activity = tools.filter(t => t.tier === 'activity').length;
  const manual = tools.filter(t => t.tier === 'manual').length;

  const liveCost = tools.filter(t => t.tier === 'live').reduce((a, t) => a + (t.monthlyCost || 0), 0);
  const totalCost = tools.reduce((a, t) => a + effectiveCost(t), 0);
  const coveragePct = Math.round((liveCost / totalCost) * 100);

  container.innerHTML = `
    <div class="coverage-row">
      <span class="coverage-label">Live API (exact)</span>
      <div class="coverage-bar"><div class="coverage-bar-fill" style="width:${(live/total)*100}%;background:var(--tier-live)"></div></div>
      <span class="coverage-pct">${live}/${total}</span>
    </div>
    <div class="coverage-row">
      <span class="coverage-label">Activity only (est.)</span>
      <div class="coverage-bar"><div class="coverage-bar-fill" style="width:${(activity/total)*100}%;background:var(--tier-activity)"></div></div>
      <span class="coverage-pct">${activity}/${total}</span>
    </div>
    <div class="coverage-row">
      <span class="coverage-label">Manual import</span>
      <div class="coverage-bar"><div class="coverage-bar-fill" style="width:${(manual/total)*100}%;background:var(--tier-manual)"></div></div>
      <span class="coverage-pct">${manual}/${total}</span>
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-subtle)">
      <div class="coverage-row">
        <span class="coverage-label" style="color:var(--text-secondary)">Exact cost coverage</span>
        <div class="coverage-bar"><div class="coverage-bar-fill" style="width:${coveragePct}%;background:var(--accent)"></div></div>
        <span class="coverage-pct text-accent">${coveragePct}%</span>
      </div>
      <div style="margin-top:6px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">
        ${coveragePct}% of spend has per-token precision. Rest is estimated.
      </div>
    </div>
  `;
}

// ============================================================
// EMPLOYEES TABLE
// ============================================================

let currentSort = 'cost';
let currentSortDir = -1;
let teamFilter = '';
let anomalyFilter = '';
let selectedEmpId = null;

function renderEmployeesTable() {
  const tbody = document.getElementById('employees-tbody');
  if (!tbody) return;

  let rows = [...employees];

  if (teamFilter) rows = rows.filter(e => e.team === teamFilter);
  if (anomalyFilter === 'anomaly') rows = rows.filter(e => e.anomaly);

  if (currentSort === 'cost') {
    rows.sort((a, b) => currentSortDir * (b.totalCost - a.totalCost));
  }

  tbody.innerHTML = rows.map(emp => {
    const teamObj = teams.find(t => t.id === emp.team);
    const toolList = emp.tools.slice(0, 4);
    const isSelected = emp.id === selectedEmpId;

    return `
      <tr 
        class="${emp.anomaly ? 'anomaly-row' : ''}${isSelected ? ' selected' : ''}" 
        data-emp-id="${emp.id}"
        tabindex="0"
        role="row"
      >
        <td>
          <div class="emp-cell">
            <div class="emp-avatar" style="${emp.anomaly ? 'background:var(--alert-dim);color:var(--alert)' : ''}">${emp.avatar}</div>
            <div>
              <span class="emp-name">${emp.name}</span>
              <span class="emp-email">${emp.email}</span>
            </div>
          </div>
        </td>
        <td>
          <span style="font-size:12px;color:var(--text-secondary)">${teamObj?.name || emp.team}</span>
          <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${emp.role}</div>
        </td>
        <td>
          <div class="tool-tags">
            ${toolList.map(tid => {
              const t = toolById(tid);
              if (!t) return '';
              const tierCls = t.shadowAI ? 'tier-flagged' : `tier-${t.tier}`;
              return `<span class="tool-tag has-tier-dot ${tierCls}">${t.name.split(' ')[0]}</span>`;
            }).join('')}
            ${emp.tools.length > 4 ? `<span class="tool-tag">+${emp.tools.length - 4}</span>` : ''}
          </div>
        </td>
        <td class="cost-cell${emp.totalCost === 0 ? ' zero' : ''}">
          ${emp.totalCost === 0 ? '—' : fmt$(emp.totalCost, 2)}
        </td>
        <td class="last-active-cell">${timeAgo(emp.lastActive)}</td>
        <td>
          ${emp.anomaly
            ? `<span class="status-badge status-anomaly">Flagged</span>`
            : `<span class="status-badge status-ok">Normal</span>`
          }
        </td>
        <td>
          <button class="btn-row-action" data-emp-drill="${emp.id}">Details →</button>
        </td>
      </tr>
    `;
  }).join('');

  // Wire row clicks for drill-down
  tbody.querySelectorAll('tr[data-emp-id]').forEach(row => {
    row.addEventListener('click', () => openEmployeeDetail(row.dataset.empId));
    row.addEventListener('keydown', e => { if (e.key === 'Enter') openEmployeeDetail(row.dataset.empId); });
  });

  // Update subtitle
  const subtitle = document.getElementById('emp-subtitle');
  if (subtitle) {
    const active = employees.filter(e => e.lastActive).length;
    subtitle.textContent = `${rows.length} shown · ${employees.filter(e => e.anomaly).length} anomalies`;
  }
}

// Filters
document.getElementById('filter-team')?.addEventListener('change', e => {
  teamFilter = e.target.value;
  renderEmployeesTable();
});

document.getElementById('filter-anomaly')?.addEventListener('change', e => {
  anomalyFilter = e.target.value;
  renderEmployeesTable();
});

// ============================================================
// EMPLOYEE DETAIL DRAWER
// ============================================================

function openEmployeeDetail(empId) {
  selectedEmpId = empId;
  const emp = employees.find(e => e.id === empId);
  if (!emp) return;

  const detail = document.getElementById('employee-detail');
  const content = document.getElementById('employee-detail-content');
  const teamObj = teams.find(t => t.id === emp.team);

  content.innerHTML = `
    <div class="detail-header">
      <div class="detail-avatar" style="${emp.anomaly ? 'background:var(--alert-dim);color:var(--alert)' : ''}">${emp.avatar}</div>
      <div>
        <div class="detail-name">${emp.name}</div>
        <div class="detail-meta">${emp.role} · ${teamObj?.name}</div>
      </div>
    </div>

    ${emp.anomaly ? `
      <div class="anomaly-flag">
        <span class="anomaly-flag-icon">◬</span>
        <div class="anomaly-flag-text">${emp.anomalyReason}</div>
      </div>
    ` : ''}

    <div class="detail-stat-row">
      <div class="detail-stat">
        <div class="detail-stat-label">Jul spend</div>
        <div class="detail-stat-value" style="${emp.totalCost > 1000 ? 'color:var(--alert)' : ''}">${emp.totalCost === 0 ? '—' : fmt$(emp.totalCost, 2)}</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-label">Tools used</div>
        <div class="detail-stat-value">${emp.tools.length}</div>
      </div>
    </div>

    <div class="detail-section-title">Usage breakdown</div>
    
    ${emp.usage.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-title">No activity this month</div>
        <div class="empty-state-desc">${emp.name.split(' ')[0]} hasn't used any connected AI tools since ${timeAgo(emp.lastActive)}.</div>
      </div>
    ` : emp.usage.map(u => {
      const tool = toolById(u.tool);
      if (!tool) return '';
      const tier = tool.tier;
      const stripeStyle = tier === 'live'
        ? 'background:var(--tier-live)'
        : tier === 'activity'
          ? 'background:repeating-linear-gradient(to bottom,var(--tier-activity) 0px,var(--tier-activity) 4px,transparent 4px,transparent 7px)'
          : 'background:repeating-linear-gradient(to bottom,var(--tier-manual) 0px,var(--tier-manual) 2px,transparent 2px,transparent 5px)';
      
      const flagStyle = u.shadowAI ? 'background:var(--alert)' : stripeStyle;

      return `
        <div class="usage-item">
          <div class="usage-tier-stripe" style="${u.shadowAI ? flagStyle : stripeStyle}"></div>
          <div>
            <div class="usage-tool-name">${tool.name}${u.shadowAI ? ' <span style="color:var(--alert);font-size:10px">◬ UNAPPROVED</span>' : ''}</div>
            <div class="usage-tool-detail">
              ${u.model ? `${u.model} · ${fmtK(u.tokens)} tokens` : `${u.sessions} sessions`}
            </div>
            <div class="usage-tool-detail">${timeAgo(u.lastUsed)}</div>
          </div>
          <div>
            <div class="usage-cost">
              ${u.cost !== null ? fmt$(u.cost, 2) : '<span style="color:var(--text-muted)">est.</span>'}
            </div>
            ${u.cost === null ? '<div class="usage-cost-note">seat-based</div>' : ''}
          </div>
        </div>
      `;
    }).join('')}
  `;

  detail.removeAttribute('hidden');
  renderEmployeesTable(); // re-render to highlight selected row
}

document.getElementById('detail-close')?.addEventListener('click', () => {
  selectedEmpId = null;
  document.getElementById('employee-detail').setAttribute('hidden', '');
  renderEmployeesTable();
});

// ============================================================
// TOOLS GRID
// ============================================================

function renderToolsGrid() {
  const grid = document.getElementById('tools-grid');
  if (!grid) return;

  grid.innerHTML = tools.map(tool => {
    const cost = effectiveCost(tool);
    const isEstimate = tool.monthlyCost === null;
    const isFlagged = tool.shadowAI || tool.status === 'flagged';
    const cardClass = isFlagged ? 'tool-card--flagged' : `tool-card--${tool.tier}`;

    let syncLine = '';
    if (tool.lastSync) {
      syncLine = `<div class="tool-meta-row"><span class="tool-meta-label">Last sync</span><span class="tool-meta-value">${timeAgo(tool.lastSync)}</span></div>`;
    } else if (tool.lastImport) {
      syncLine = `<div class="tool-meta-row"><span class="tool-meta-label">Last import</span><span class="tool-meta-value">${new Date(tool.lastImport).toLocaleDateString('en-US', {month:'short',day:'numeric'})}</span></div>`;
    }

    const tierInfo = INTEGRATION_TIERS[tool.tier];
    const dotClass = isFlagged ? 'status-dot--flagged' : `status-dot--${tool.tier}`;

    return `
      <div class="tool-card ${cardClass}">
        <div class="tool-card-header">
          <div class="tool-card-name">${tool.name}</div>
          <div class="tool-card-status">
            <div class="status-dot ${dotClass}"></div>
            <span class="tier-badge tier--${isFlagged ? 'flagged' : tool.tier}">${isFlagged ? 'Flagged' : tierInfo.label}</span>
          </div>
        </div>

        <div class="tool-card-cost">
          ${cost > 0 ? fmt$(cost, 2) : '<span style="color:var(--text-muted)">—</span>'}
          ${isEstimate && cost > 0 ? '' : ''}
        </div>
        <div class="tool-card-cost-note">
          ${isEstimate ? `estimated · ${tierInfo.description}` : `exact · ${tierInfo.description}`}
        </div>

        <div class="tool-card-meta">
          ${tool.seatsUsed !== null ? `
            <div class="tool-meta-row">
              <span class="tool-meta-label">Seats</span>
              <span class="tool-meta-value">${tool.seatsUsed}${tool.seatsTotal ? '/' + tool.seatsTotal : ''} used${tool.pricePerSeat ? ' · $' + tool.pricePerSeat + '/mo' : ''}</span>
            </div>
          ` : ''}
          ${tool.models ? `
            <div class="tool-meta-row">
              <span class="tool-meta-label">Models</span>
              <span class="tool-meta-value">${tool.models.slice(0, 2).join(', ')}${tool.models.length > 2 ? ' +' + (tool.models.length - 2) : ''}</span>
            </div>
          ` : ''}
          <div class="tool-meta-row">
            <span class="tool-meta-label">Connected</span>
            <span class="tool-meta-value">${new Date(tool.connectedAt).toLocaleDateString('en-US', {month:'short', year:'numeric'})}</span>
          </div>
          ${syncLine}
        </div>

        ${isFlagged ? `
          <div class="tool-card-shadow-flag">
            ◬ Shadow AI — not approved by IT. Review required.
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ============================================================
// ADD INTEGRATION FLOW
// ============================================================

const availableProviders = [
  { id: 'openai-new', name: 'OpenAI', tier: 'live', method: 'apikey', description: 'API key · per-token cost data' },
  { id: 'anthropic-new', name: 'Anthropic', tier: 'live', method: 'apikey', description: 'API key · per-token cost data' },
  { id: 'gemini-new', name: 'Google Gemini', tier: 'live', method: 'apikey', description: 'API key · per-token cost data' },
  { id: 'mistral-new', name: 'Mistral AI', tier: 'live', method: 'apikey', description: 'API key · per-token cost data' },
  { id: 'copilot-new', name: 'GitHub Copilot', tier: 'activity', method: 'oauth', description: 'OAuth · session data only' },
  { id: 'chatgpt-team-new', name: 'ChatGPT Team', tier: 'activity', method: 'oauth', description: 'OAuth · session data only' },
  { id: 'perplexity-new', name: 'Perplexity', tier: 'manual', method: 'csv', description: 'CSV import · monthly totals' },
  { id: 'cohere-new', name: 'Cohere', tier: 'live', method: 'apikey', description: 'API key · per-token cost data' },
  { id: 'groq-new', name: 'Groq', tier: 'live', method: 'apikey', description: 'API key · per-token cost data' },
];

let selectedProvider = null;

function renderProviderGrid() {
  const grid = document.getElementById('provider-grid');
  if (!grid) return;

  grid.innerHTML = availableProviders.map(p => `
    <button 
      class="provider-card${selectedProvider?.id === p.id ? ' selected' : ''}" 
      data-provider-id="${p.id}"
      aria-pressed="${selectedProvider?.id === p.id}"
    >
      <div class="provider-card-name">${p.name}</div>
      <div class="provider-card-tier">${p.description}</div>
      <span class="tier-badge tier--${p.tier}">${INTEGRATION_TIERS[p.tier].label}</span>
    </button>
  `).join('');

  grid.querySelectorAll('.provider-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedProvider = availableProviders.find(p => p.id === card.dataset.providerId);
      renderProviderGrid();
      goToIntegrationStep(2);
    });
  });
}

function goToIntegrationStep(step) {
  document.querySelectorAll('.integration-step').forEach((el, i) => {
    el.classList.toggle('hidden', i + 1 !== step);
  });
  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i + 1 < step) el.classList.add('done');
    if (i + 1 === step) el.classList.add('active');
  });

  if (step === 2 && selectedProvider) {
    renderConnectForm();
  }
  if (step === 3) {
    startVerification();
  }
}

function renderConnectForm() {
  const form = document.getElementById('connect-form');
  const title = document.getElementById('step2-title');
  if (!form || !selectedProvider) return;

  title.textContent = `Connect ${selectedProvider.name}`;

  const willGet = {
    live: ['Per-token usage per employee', 'Real-time cost attribution', 'Model-level breakdown', 'Exact dollar figures'],
    activity: ['Session counts per employee', 'Last-active timestamps', 'Seat utilization data'],
    manual: ['Monthly totals from exported CSV', 'No per-employee breakdown'],
  };

  const wontGet = {
    live: [],
    activity: ['Token-level usage', 'Exact cost — seat estimates only'],
    manual: ['Real-time data', 'Per-employee breakdown', 'Token counts'],
  };

  let formFields = '';

  if (selectedProvider.method === 'apikey') {
    formFields = `
      <div class="form-field">
        <label class="form-label" for="api-key-input">API Key</label>
        <input type="password" id="api-key-input" class="form-input mono" placeholder="sk-..." autocomplete="off" />
        <div class="form-hint">Your key is stored encrypted. Orbital only reads usage data — never content.</div>
      </div>
      <div class="form-field">
        <label class="form-label" for="org-id-input">Organization ID (optional)</label>
        <input type="text" id="org-id-input" class="form-input mono" placeholder="org-..." />
      </div>
      <button class="btn-primary btn-full" id="btn-verify-connection" style="margin-top:0">Verify connection →</button>
    `;
  } else if (selectedProvider.method === 'oauth') {
    formFields = `
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
        Authorize Orbital to read usage and seat data from ${selectedProvider.name}. No content is ever accessed.
      </p>
      <button class="oauth-btn" id="btn-oauth-connect">
        <span>↗</span> Authorize with ${selectedProvider.name}
      </button>
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">
        You'll be redirected to ${selectedProvider.name} to approve read-only access.
      </div>
    `;
  } else {
    formFields = `
      <div class="form-field">
        <label class="form-label" for="csv-upload">Upload usage CSV</label>
        <input type="file" id="csv-upload" class="form-input" accept=".csv" />
        <div class="form-hint">Export from ${selectedProvider.name} → Settings → Usage → Download CSV</div>
      </div>
      <button class="btn-primary btn-full" id="btn-verify-connection" style="margin-top:0">Import data →</button>
    `;
  }

  form.innerHTML = `
    <button class="connect-form-back" id="btn-back-to-step1">← Choose different provider</button>
    ${formFields}

    <div class="data-will-get" style="margin-top:20px">
      <div class="data-will-get-title">You'll get</div>
      <ul class="data-will-get-list">
        ${willGet[selectedProvider.tier].map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
    ${wontGet[selectedProvider.tier].length > 0 ? `
      <div class="data-wont-get">
        <div class="data-wont-get-title">You won't get</div>
        <ul class="data-wont-get-list">
          ${wontGet[selectedProvider.tier].map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `;

  document.getElementById('btn-back-to-step1')?.addEventListener('click', () => {
    selectedProvider = null;
    goToIntegrationStep(1);
  });

  document.getElementById('btn-verify-connection')?.addEventListener('click', () => {
    goToIntegrationStep(3);
  });

  document.getElementById('btn-oauth-connect')?.addEventListener('click', () => {
    goToIntegrationStep(3);
  });
}

function startVerification() {
  const spinner = document.getElementById('verify-spinner');
  const success = document.getElementById('verify-success');

  if (!spinner || !success) return;

  spinner.classList.remove('hidden');
  success.classList.add('hidden');

  setTimeout(() => {
    spinner.classList.add('hidden');
    success.classList.remove('hidden');
  }, 1800);
}

document.getElementById('btn-finish-integration')?.addEventListener('click', () => {
  // In a real app: save and redirect to tools view
  navigate('tools');
  goToIntegrationStep(1);
  selectedProvider = null;
  renderProviderGrid();
});

document.getElementById('btn-manual-import')?.addEventListener('click', () => {
  selectedProvider = availableProviders.find(p => p.method === 'csv');
  if (selectedProvider) goToIntegrationStep(2);
});

// ============================================================
// ALERTS & BUDGETS
// ============================================================

function renderBudgetThresholds() {
  const container = document.getElementById('budget-thresholds');
  if (!container) return;

  container.innerHTML = teams.map(t => {
    const pct = (t.spent / t.budget) * 100;
    const cls = pct >= 95 ? 'danger' : pct >= 80 ? 'warning' : 'safe';
    const remaining = t.budget - t.spent;

    return `
      <div class="budget-threshold-item">
        <div>
          <div class="budget-team-name">${t.name}</div>
          <div class="budget-team-lead">Lead: ${t.lead}</div>
        </div>
        <div class="budget-progress-wrap">
          <div class="budget-progress-bar">
            <div class="budget-progress-fill ${cls}" style="width:${Math.min(pct,100)}%"></div>
          </div>
          <div class="budget-progress-labels">
            <span>${pct.toFixed(1)}% used</span>
            <span>${fmt$(remaining)} remaining</span>
          </div>
        </div>
        <div class="budget-values">
          <div class="budget-spent" style="${pct >= 95 ? 'color:var(--alert)' : ''}">${fmt$(t.spent)}</div>
          <div class="budget-remaining">of ${fmt$(t.budget)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAlertLog(filter = 'all') {
  const container = document.getElementById('alert-log');
  if (!container) return;

  let alerts = [...budgetAlerts];
  if (filter !== 'all') alerts = alerts.filter(a => a.status === filter);

  if (alerts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">No ${filter} alerts right now</div>
        <div class="empty-state-desc">Orbital will notify you when thresholds are crossed or unapproved tools appear.</div>
      </div>
    `;
    return;
  }

  const iconMap = {
    critical: '◬',
    warning: '◎',
  };

  container.innerHTML = alerts.map(alert => {
    const emp = alert.employee ? employees.find(e => e.id === alert.employee) : null;

    return `
      <div class="alert-item">
        <div class="alert-icon-wrap ${alert.status}">
          ${iconMap[alert.status]}
        </div>
        <div class="alert-content">
          <div class="alert-title ${alert.status}">${alert.message}</div>
          <div class="alert-desc">
            ${alert.type === 'shadow_ai' ? `<strong>${emp?.name}</strong> used an unapproved tool. Review usage and revoke access if needed.` : ''}
            ${alert.type === 'spend_spike' ? `<strong>${emp?.name}</strong>'s spend this month is <span style="color:var(--alert)">+${alert.pct}%</span> above their usual average. Check for misuse or misconfigured batch jobs.` : ''}
            ${alert.team && !alert.type ? `${teams.find(t=>t.id===alert.team)?.name} team is on track to exceed budget if spend continues at the current rate.` : ''}
          </div>
          <div class="alert-meta">Triggered ${timeAgo(alert.triggeredAt)}</div>
        </div>
        <div class="alert-actions">
          ${alert.type === 'shadow_ai' ? `<button class="btn-alert-action" style="border-color:var(--alert);color:var(--alert)">Revoke access</button>` : ''}
          ${alert.type === 'spend_spike' ? `<button class="btn-alert-action">Review usage</button>` : ''}
          ${!alert.type ? `<button class="btn-alert-action">Adjust budget</button>` : ''}
          <button class="btn-alert-action dismiss">Dismiss</button>
        </div>
      </div>
    `;
  }).join('');

  // Wire dismiss buttons
  container.querySelectorAll('.btn-alert-action.dismiss').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.closest('.alert-item').style.opacity = '0.3';
      btn.disabled = true;
      btn.textContent = 'Dismissed';
    });
  });
}

// Alert filter chips
let currentAlertFilter = 'all';
document.getElementById('filter-all')?.addEventListener('click', () => { currentAlertFilter = 'all'; syncAlertChips(); renderAlertLog('all'); });
document.getElementById('filter-critical')?.addEventListener('click', () => { currentAlertFilter = 'critical'; syncAlertChips(); renderAlertLog('critical'); });
document.getElementById('filter-warning')?.addEventListener('click', () => { currentAlertFilter = 'warning'; syncAlertChips(); renderAlertLog('warning'); });

function syncAlertChips() {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.getElementById(`filter-${currentAlertFilter}`)?.classList.add('active');
}

// ============================================================
// INIT
// ============================================================

function init() {
  renderTrendChart();
  renderTopTools();
  renderTeamBudgets('team-budget-list');
  renderCoverageBreakdown();
  renderEmployeesTable();
  renderToolsGrid();
  renderProviderGrid();
  renderBudgetThresholds();
  renderAlertLog('all');
}

init();
