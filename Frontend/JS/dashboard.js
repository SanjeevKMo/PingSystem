// Dashboard Functionality
const API_URL = 'http://localhost:5001/api';

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard initialized');
  setActiveNavLink();
  loadSystemsData();
  loadAgencies();
  setupEventListeners();
});

/**
 * Load systems data from API and update the dashboard
 */
async function loadSystemsData() {
  try {
    const response = await fetch(`${API_URL}/systems`);
    const data = await response.json();

    if (data.success && data.data) {
      const systems = data.data;
      
      // Update summary cards
      updateSummaryCards(systems);
      
      // Update systems table
      updateSystemsTable(systems);
      
      // Update notifications
      updateNotifications(systems);
      
      console.log(`Loaded ${systems.length} systems from API`);
    } else {
      console.warn('Failed to load systems:', data.message);
    }
  } catch (error) {
    console.error('Error loading systems:', error);
    console.log('Using fallback static data');
  }
}

/**
 * Update summary cards with real data
 * FIXED: Handle uptime as string and convert to number
 */
function updateSummaryCards(systems) {
  const totalSystems = systems.length;
  const systemsUp = systems.filter(s => s.status === 'Up').length;
  const systemsDown = systems.filter(s => s.status === 'Down').length;
  
  // FIXED: Convert uptime strings to numbers and calculate average
  const systemsWithUptime = systems.filter(s => s.uptime_percentage && parseFloat(s.uptime_percentage) > 0);
  const uptimeSum = systemsWithUptime.reduce((sum, s) => {
    const uptime = parseFloat(s.uptime_percentage) || 0;
    return sum + uptime;
  }, 0);
  
  const avgUptime = systemsWithUptime.length > 0 
    ? Math.round((uptimeSum / systemsWithUptime.length) * 10) / 10  // Round to 1 decimal
    : 0;

  console.log('Uptime calculation:', {
    systemsWithUptime: systemsWithUptime.length,
    uptimeSum,
    avgUptime
  });

  // Update total systems card
  const totalCard = document.getElementById('total-systems');
  if (totalCard) totalCard.textContent = totalSystems;

  // Update systems up card
  const upCard = document.getElementById('systems-up');
  if (upCard) upCard.textContent = systemsUp;
  
  const upPercentEl = document.getElementById('systems-up-percent');
  if (upPercentEl && totalSystems > 0) {
    const upPercent = Math.round((systemsUp / totalSystems) * 100);
    upPercentEl.textContent = `↑ ${upPercent}%`;
  }

  // Update systems down card
  const downCard = document.getElementById('systems-down');
  if (downCard) downCard.textContent = systemsDown;
  
  const downPercentEl = document.getElementById('systems-down-percent');
  if (downPercentEl && totalSystems > 0) {
    const downPercent = Math.round((systemsDown / totalSystems) * 100);
    downPercentEl.textContent = `↓ ${downPercent}%`;
  }

  // Update average uptime card - FIXED
  const avgUptimeEl = document.getElementById('avg-uptime');
  if (avgUptimeEl) {
    avgUptimeEl.textContent = `${avgUptime}%`;
  }

  // Update pie chart
  updatePieChart(avgUptime, systemsUp, systemsDown);
}

/**
 * Update pie chart with real percentages
 */
function updatePieChart(uptime, up, down) {
  const pieSvg = document.querySelector('.pie-chart');
  if (!pieSvg) return;

  const totalCircumference = 251.2;
  const total = up + down;
  
  if (total === 0) return;
  
  const upPercentage = up / total;
  const downPercentage = down / total;

  const circles = pieSvg.querySelectorAll('circle');
  if (circles.length >= 2) {
    circles[0].style.strokeDasharray = `${upPercentage * totalCircumference} ${totalCircumference}`;
    circles[1].style.strokeDashoffset = `-${upPercentage * totalCircumference}`;
    circles[1].style.strokeDasharray = `${downPercentage * totalCircumference} ${totalCircumference}`;
  }

  const legend = document.querySelector('.chart-legend');
  if (legend) {
    const upPct = Math.round(upPercentage * 100);
    const downPct = Math.round(downPercentage * 100);
    legend.innerHTML = `
      <div><span class="legend-up"></span> Up: ${upPct}%</div>
      <div><span class="legend-down"></span> Down: ${downPct}%</div>
    `;
  }
}

/**
 * Update systems table with real data
 */
function updateSystemsTable(systems) {
  const tableBody = document.getElementById('systems-tbody');
  if (!tableBody) return;

  if (systems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px; color: var(--color-text-secondary);">
          No systems found
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = systems.map(system => {
    const statusClass = system.status === 'Up' ? 'status-up' : 
                       (system.status === 'Down' ? 'status-down' : 'status-maintenance');
    const statusBadge = `<span class="${statusClass}">${escapeHtml(system.status)}</span>`;
    const lastCheck = formatDateTime(system.last_check) || 'N/A';
    const uptime = system.uptime_percentage ? `${system.uptime_percentage}%` : 'N/A';

    return `
      <tr>
        <td><strong>${escapeHtml(system.name)}</strong></td>
        <td>${escapeHtml(system.agency)}</td>
        <td>${escapeHtml(system.type)}</td>
        <td>${statusBadge}</td>
        <td>${escapeHtml(uptime)}</td>
        <td>${escapeHtml(lastCheck)}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Load agencies from API and render buttons linking to the dynamic agency page
 */
async function loadAgencies() {
  try {
    const res = await fetch(`${API_URL}/agencies`);
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      console.warn('Failed to load agencies:', json.message);
      return;
    }

    const container = document.getElementById('agencies-container');
    if (!container) return;

    container.innerHTML = json.data.map(a => {
      const iconHtml = a.icon_url ?
        `<img src="${escapeHtml(a.icon_url)}" alt="${escapeHtml(a.name)}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:8px;">` :
        (a.icon_emoji ? `<span style="font-size:20px;margin-right:8px;vertical-align:middle;">${escapeHtml(a.icon_emoji)}</span>` : '');

      const style = a.color_code ? `style="border-color:${escapeHtml(a.color_code)}; color:${escapeHtml(a.color_code)}"` : '';

      return `<a href="agency.html?agency_id=${a.id}" class="btn-agency" ${style}>${iconHtml}${escapeHtml(a.name)}</a>`;
    }).join('');

    console.log(`Rendered ${json.data.length} agencies`);
  } catch (err) {
    console.error('Error loading agencies:', err);
  }
}

/**
 * Update notifications with real data
 */
function updateNotifications(systems) {
  const notificationList = document.querySelector('.notification-list');
  if (!notificationList) return;

  const downSystems = systems.filter(s => s.status === 'Down');

  if (downSystems.length === 0) {
    notificationList.innerHTML = `
      <div class="notification notification-success">
        <span class="notification-icon">✓</span>
        <div class="notification-content">
          <div class="notification-title">All Clear</div>
          <div class="notification-message">All monitored systems are operational</div>
          <div class="notification-time">${new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    `;
    return;
  }

  notificationList.innerHTML = downSystems.map(system => `
    <div class="notification notification-alert">
      <span class="notification-icon">⚠️</span>
      <div class="notification-content">
        <div class="notification-title">Critical Alert</div>
        <div class="notification-message">${escapeHtml(system.name)} (${escapeHtml(system.agency)}) is down</div>
        <div class="notification-time">${formatDateTime(system.last_check) || 'Just now'}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Set active navigation link based on current page
 */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Setup event listeners for interactive elements
 */
function setupEventListeners() {
  const downCard = document.querySelector('.card.card-down');
  if (downCard) {
    downCard.addEventListener('click', function() {
      const systemTable = document.querySelector('.system-table');
      if (systemTable) {
        systemTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      console.log('Navigated to systems list');
    });
  }

  const tableRows = document.querySelectorAll('table tbody tr');
  
  tableRows.forEach(row => {
    row.addEventListener('click', function() {
      const systemName = this.cells[0]?.textContent;
      const status = this.cells[1]?.textContent;
      if (systemName && status) {
        console.log(`Clicked: ${systemName} - Status: ${status}`);
      }
    });
  });
}

/**
 * Format date/time for display
 */
function formatDateTime(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return null;
  }
}

/**
 * Escape HTML special characters for safe display
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setActiveNavLink,
    setupEventListeners,
    loadSystemsData,
    updateSummaryCards,
    updateSystemsTable,
    updateNotifications,
    formatDateTime,
    escapeHtml
  };
}