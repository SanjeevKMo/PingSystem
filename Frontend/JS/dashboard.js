// ================================
// Dashboard Configuration
// ================================
const API_URL = 'http://localhost:5001/api';

// ================================
// Initialize Dashboard
// ================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard initialized');

  setActiveNavLink();
  loadSystemsData();       // Summary cards + notifications + chart
  loadDownSystemsData();   // Table (Down systems only)
  loadAgencies();
  setupEventListeners();
});

// ================================
// Load ALL systems (summary purpose)
// ================================
async function loadSystemsData() {
  try {
    const res = await fetch(`${API_URL}/systems`);
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      console.warn('Failed to load systems');
      return;
    }

    updateSummaryCards(json.data);
    updateNotifications(json.data);

    console.log(`Loaded ${json.data.length} systems`);
  } catch (err) {
    console.error('Error loading systems:', err);
  }
}

// ================================
// Summary Cards + Pie Chart
// ================================
function updateSummaryCards(systems) {
  const total = systems.length;
  const up = systems.filter(s => s.status === 'Up').length;
  const down = systems.filter(s => s.status === 'Down').length;

  const uptimeSystems = systems.filter(s => Number.parseFloat(s.uptime_percentage) > 0);
  const avgUptime = uptimeSystems.length
    ? Math.round(
        uptimeSystems.reduce((sum, s) => sum + Number.parseFloat(s.uptime_percentage), 0) /
        uptimeSystems.length * 10
      ) / 10
    : 0;

  setText('total-systems', total);
  setText('systems-up', up);
  setText('systems-down', down);
  setText('avg-uptime', `${avgUptime}%`);

  setText('systems-up-percent', total ? `↑ ${Math.round((up / total) * 100)}%` : '');
  setText('systems-down-percent', total ? `↓ ${Math.round((down / total) * 100)}%` : '');

  updatePieChart(up, down);
}

// ================================
// Pie Chart
// ================================
function updatePieChart(up, down) {
  const svg = document.querySelector('.pie-chart');
  if (!svg) return;

  const total = up + down;
  if (!total) return;

  const circumference = 251.2;
  const upPct = up / total;

  const [upCircle, downCircle] = svg.querySelectorAll('circle');

  upCircle.style.strokeDasharray = `${upPct * circumference} ${circumference}`;
  downCircle.style.strokeDashoffset = `-${upPct * circumference}`;
  downCircle.style.strokeDasharray = `${(1 - upPct) * circumference} ${circumference}`;

  const legend = document.querySelector('.chart-legend');
  if (legend) {
    legend.innerHTML = `
      <div><span class="legend-up"></span> Up: ${Math.round(upPct * 100)}%</div>
      <div><span class="legend-down"></span> Down: ${Math.round((1 - upPct) * 100)}%</div>
    `;
  }
}

// ================================
// Load DOWN systems (table only)
// ================================
async function loadDownSystemsData() {
  try {
    const res = await fetch(`${API_URL}/systems/status?status=Down`);
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      console.warn('Failed to load Down systems');
      return;
    }

    updateSystemsTable(json.data);
    console.log(`Loaded ${json.data.length} Down systems`);
  } catch (err) {
    console.error('Error loading Down systems:', err);
  }
}

// ================================
// Systems Table
// ================================
function updateSystemsTable(systems) {
  const tbody = document.getElementById('systems-tbody');
  if (!tbody) return;

  if (!systems.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:20px;">
          No systems currently down
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = systems.map(s => `
    <tr>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td>${escapeHtml(s.agency)}</td>
      <td>${escapeHtml(s.type)}</td>
      <td><span class="status-down">Down</span></td>
      <td>${s.uptime_percentage ? `${s.uptime_percentage}%` : 'N/A'}</td>
      <td>${formatDateTime(s.last_check) || 'N/A'}</td>
    </tr>
  `).join('');
}

// ================================
// Notifications
// ================================
function updateNotifications(systems) {
  const container = document.querySelector('.notification-list');
  if (!container) return;

  const down = systems.filter(s => s.status === 'Down');

  if (!down.length) {
    container.innerHTML = `
      <div class="notification notification-success">
        <span>✓</span>
        <div>
          <div>All Clear</div>
          <small>All systems operational</small>
        </div>
      </div>`;
    return;
  }

  container.innerHTML = down.map(s => `
    <div class="notification notification-alert">
      <span>⚠️</span>
      <div>
        <div>Critical Alert</div>
        <small>${escapeHtml(s.name)} (${escapeHtml(s.agency)}) is down</small>
      </div>
    </div>
  `).join('');
}

// ================================
// Agencies
// ================================
async function loadAgencies() {
  try {
    const res = await fetch(`${API_URL}/agencies`);
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) return;

    const container = document.getElementById('agencies-container');
    if (!container) return;

    container.innerHTML = json.data.map(a => `
      <a href="agency.html?agency_id=${a.id}" class="btn-agency">
        ${escapeHtml(a.name)}
      </a>
    `).join('');

  } catch (err) {
    console.error('Error loading agencies:', err);
  }
}

// ================================
// UI Helpers
// ================================
function setActiveNavLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === page)
  );
}

function setupEventListeners() {
  const downCard = document.querySelector('.card.card-down');
  if (downCard) {
    downCard.onclick = () =>
      document.querySelector('.system-table')?.scrollIntoView({ behavior: 'smooth' });
  }
}

// ================================
// Utilities
// ================================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatDateTime(val) {
  if (!val) return null;
  return new Date(val).toLocaleString();
}

function escapeHtml(text) {
  return String(text || '').replaceAll(/[&<>"]'/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])
  );
}
