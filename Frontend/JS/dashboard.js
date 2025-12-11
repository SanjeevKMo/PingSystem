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
    // Fall back to static data if API fails
    console.log('Using fallback static data');
  }
}

/**
 * Update summary cards with real data
 */
function updateSummaryCards(systems) {
  const totalSystems = systems.length;
  const systemsUp = systems.filter(s => s.status === 'Up').length;
  const systemsDown = systems.filter(s => s.status === 'Down').length;
  const uptime = totalSystems > 0 ? Math.round((systemsUp / totalSystems) * 100) : 0;

  // Update total systems card
  const totalCard = document.querySelector('.summary-cards .card-stat:nth-child(1) .card-value');
  if (totalCard) totalCard.textContent = totalSystems;

  // Update systems up card
  const upCard = document.querySelector('.summary-cards .card-stat:nth-child(2) .card-value');
  if (upCard) upCard.textContent = systemsUp;

  // Update systems down card
  const downCard = document.querySelector('.summary-cards .card-stat:nth-child(3) .card-value');
  if (downCard) downCard.textContent = systemsDown;

  // Update pie chart
  updatePieChart(uptime, systemsUp, systemsDown);
}

/**
 * Update pie chart with real percentages
 */
function updatePieChart(uptime, up, down) {
  const pieSvg = document.querySelector('.pie-chart');
  if (!pieSvg) return;

  // Calculate the stroke dasharray for the pie chart
  // Circle circumference is 2πr, we use r=40 so circumference ≈ 251.2
  const totalCircumference = 251.2;
  const upPercentage = up / (up + down) || 0;
  const downPercentage = down / (up + down) || 0;

  const circles = pieSvg.querySelectorAll('circle');
  if (circles.length >= 2) {
    // Green circle for up
    circles[0].style.strokeDasharray = `${upPercentage * totalCircumference} ${totalCircumference}`;
    // Red circle for down
    circles[1].style.strokeDashoffset = `-${upPercentage * totalCircumference}`;
    circles[1].style.strokeDasharray = `${downPercentage * totalCircumference} ${totalCircumference}`;
  }

  // Update legend
  const legend = document.querySelector('.chart-legend');
  if (legend) {
    legend.innerHTML = `
      <div><span class="legend-up"></span> Up: ${uptime}%</div>
      <div><span class="legend-down"></span> Down: ${100 - uptime}%</div>
    `;
  }
}

/**
 * Update systems table with real data
 */
function updateSystemsTable(systems) {
  const tableBody = document.querySelector('.system-table tbody');
  if (!tableBody) return;

  // Filter to show only down systems (as per original requirement)
  const downSystems = systems.filter(s => s.status === 'Down');

  if (downSystems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #28a745; padding: 20px;">
          ✓ All systems are operational
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = downSystems.map(system => `
    <tr>
      <td>${escapeHtml(system.name)}</td>
      <td><span class="status-down">Down</span></td>
      <td>${formatDateTime(system.last_check) || 'N/A'}</td>
      <td>${escapeHtml(system.agency)}</td>
    </tr>
  `).join('');
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

    const container = document.querySelector('.agency-buttons');
    if (!container) return;

    container.innerHTML = json.data.map(a => {
      const iconHtml = a.icon_url ?
        `<img src="${a.icon_url}" alt="${escapeHtml(a.name)}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:8px;">` :
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

  // Get down systems for notifications
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
  // Click handler for Systems Down card
  const downCard = document.querySelector('.card.card-down');
  if (downCard) {
    downCard.addEventListener('click', function() {
      // Scroll to the systems table to show down systems
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
      const systemName = this.cells[0].textContent;
      const status = this.cells[1].textContent;
      console.log(`Clicked: ${systemName} - Status: ${status}`);
    });
  });
}

/**
 * Format date/time for display
 */
function formatDateTime(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
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
  return text.replace(/[&<>"']/g, m => map[m]);
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
