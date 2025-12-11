// Dynamic Agency Page
const API_URL = 'http://localhost:5001/api';

function q(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

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

function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'agency.html';
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) link.classList.add('active');
    else link.classList.remove('active');
  });
}

/**
 * Load all agencies and populate sidebar
 */
async function loadAgenciesSidebar(currentAgencyId) {
  try {
    const res = await fetch(`${API_URL}/agencies`);
    const json = await res.json();
    
    if (!json.success || !Array.isArray(json.data)) {
      console.error('Failed to load agencies for sidebar');
      return;
    }

    const list = document.getElementById('agenciesList');
    if (!list) {
      console.error('agenciesList element not found');
      return;
    }

    list.innerHTML = json.data.map(agency => {
      const iconHtml = agency.icon_url
        ? `<img src="${escapeHtml(agency.icon_url)}" alt="${escapeHtml(agency.name)}" style="width:20px;height:20px;object-fit:contain;">`
        : (agency.icon_emoji ? `<span class="agency-icon">${escapeHtml(agency.icon_emoji)}</span>` : `<span class="agency-icon">${escapeHtml(agency.name.charAt(0).toUpperCase())}</span>`);

      const isActive = parseInt(currentAgencyId) === parseInt(agency.id);
      const activeClass = isActive ? 'active' : '';
      const systemCount = agency.systems_count || 0;

      return `
        <li>
          <a href="agency.html?agency_id=${agency.id}" class="${activeClass}" title="${escapeHtml(agency.name)}">
            ${iconHtml}
            <span class="agency-name">${escapeHtml(agency.name)}</span>
            <span class="agency-count">${systemCount}</span>
          </a>
        </li>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading agencies sidebar:', err);
  }
}

/**
 * Load agency by ID and display details
 * FIXED: Properly calculate and display stats
 */
async function loadAgencyById(id) {
  try {
    const res = await fetch(`${API_URL}/agencies/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!json.success) {
      showError(json.message || 'Failed to load agency');
      return;
    }

    const agency = json.data;
    
    // Update agency header info
    const titleEl = document.getElementById('agencyTitle');
    const iconEl = document.getElementById('agencyIcon');
    const descEl = document.getElementById('agencyDescription');
    const nameEl = document.getElementById('agencyName');
    
    if (titleEl) titleEl.textContent = agency.name || 'Agency';
    if (descEl) descEl.textContent = agency.description || '';
    if (nameEl) nameEl.textContent = agency.name || '';

    if (iconEl) {
      if (agency.icon_url) {
        iconEl.innerHTML = `<img src="${escapeHtml(agency.icon_url)}" alt="${escapeHtml(agency.name)}" style="width:48px;height:48px;object-fit:contain;border-radius:6px;">`;
      } else if (agency.icon_emoji) {
        iconEl.textContent = agency.icon_emoji;
      } else {
        iconEl.textContent = agency.name ? agency.name.charAt(0) : 'A';
      }
    }

    // FIXED: Update stats with proper values
    const systems = Array.isArray(agency.systems) ? agency.systems : [];
    const totalSystems = systems.length;
    const systemsUp = systems.filter(s => s.status === 'Up').length;
    const systemsDown = systems.filter(s => s.status === 'Down').length;
    
    // Calculate average uptime
    const uptimes = systems
      .map(s => parseFloat(s.uptime_percentage))
      .filter(u => !isNaN(u) && u > 0);
    
    const avgUptime = uptimes.length > 0
      ? (uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(1)
      : '0.0';
    
    console.log('Agency stats:', {
      total: totalSystems,
      up: systemsUp,
      down: systemsDown,
      avgUptime: avgUptime,
      systems: systems
    });
    
    const totalSystemsEl = document.getElementById('totalSystems');
    const systemsUpEl = document.getElementById('systemsUp');
    const systemsDownEl = document.getElementById('systemsDown');
    const avgUptimeEl = document.getElementById('agency-avg-uptime');
    
    if (totalSystemsEl) {
      totalSystemsEl.textContent = totalSystems;
      console.log('✅ Set totalSystems to:', totalSystems);
    }
    if (systemsUpEl) {
      systemsUpEl.textContent = systemsUp;
      console.log('✅ Set systemsUp to:', systemsUp);
    }
    if (systemsDownEl) {
      systemsDownEl.textContent = systemsDown;
      console.log('✅ Set systemsDown to:', systemsDown);
    }
    if (avgUptimeEl) {
      avgUptimeEl.textContent = avgUptime + '%';
      console.log('✅ Set avgUptime to:', avgUptime + '%');
    }

    // Show stats section if there are systems
    const statsSection = document.getElementById('agency-stats-section');
    if (statsSection && totalSystems > 0) {
      statsSection.style.display = 'grid';
      console.log('✅ Showed stats section');
    }

    // Update systems table
    const tbody = document.getElementById('systemsBody');
    if (!tbody) {
      console.error('systemsBody element not found');
      return;
    }

    if (systems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;">No systems found for this agency</td></tr>`;
      return;
    }

    tbody.innerHTML = systems.map(s => {
      const statusClass = s.status === 'Up' ? 'status-up' : (s.status === 'Down' ? 'status-down' : 'status-maintenance');
      const lastCheck = s.last_check ? (new Date(s.last_check)).toLocaleString() : 'N/A';
      const uptime = s.uptime_percentage !== undefined && s.uptime_percentage !== null ? `${s.uptime_percentage}%` : 'N/A';

      return `
        <tr>
          <td><strong>${escapeHtml(s.name)}</strong></td>
          <td>${escapeHtml(s.type || 'N/A')}</td>
          <td><span class="${statusClass}">${escapeHtml(s.status || 'N/A')}</span></td>
          <td>${escapeHtml(uptime)}</td>
          <td>${escapeHtml(lastCheck)}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading agency:', err);
    showError('Connection error. Please check backend.');
  }
}

function showError(message) {
  const tbody = document.getElementById('systemsBody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#dc3545; padding:20px;">⚠️ ${escapeHtml(message)}</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Agency page initialized');
  
  setActiveNavLink();
  const agencyId = q('agency_id') || q('id');
  
  if (!agencyId) {
    showError('No agency specified');
    return;
  }

  console.log('📍 Loading agency:', agencyId);

  // Load sidebar agencies
  loadAgenciesSidebar(agencyId);
  
  // Load current agency data
  loadAgencyById(agencyId);
});