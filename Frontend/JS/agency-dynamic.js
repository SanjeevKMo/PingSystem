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

async function loadAgencyById(id) {
  try {
    const res = await fetch(`${API_URL}/agencies/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!json.success) {
      showError(json.message || 'Failed to load agency');
      return;
    }

    const agency = json.data;
    document.getElementById('agencyTitle').textContent = agency.name || 'Agency';

    const iconEl = document.getElementById('agencyIcon');
    if (agency.icon_url) {
      iconEl.innerHTML = `<img src="${escapeHtml(agency.icon_url)}" alt="${escapeHtml(agency.name)}" style="width:48px;height:48px;object-fit:contain;border-radius:6px;">`;
    } else if (agency.icon_emoji) {
      iconEl.textContent = agency.icon_emoji;
    } else {
      iconEl.textContent = agency.name ? agency.name.charAt(0) : 'A';
    }

    document.getElementById('agencyName').textContent = agency.name || '';
    document.getElementById('agencyDescription').textContent = agency.description || '';

    document.getElementById('totalSystems').textContent = agency.systems_count || 0;
    document.getElementById('systemsUp').textContent = agency.systems_up || 0;
    document.getElementById('systemsDown').textContent = agency.systems_down || 0;

    const tbody = document.getElementById('systemsBody');
    if (!tbody) return;

    const systems = Array.isArray(agency.systems) ? agency.systems : [];
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
          <td>${escapeHtml(s.name)}</td>
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
  if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#dc3545; padding:20px;">⚠️ ${escapeHtml(message)}</td></tr>`;
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
  const agencyId = q('agency_id') || q('id');
  if (!agencyId) {
    showError('No agency specified');
    return;
  }

  loadAgencyById(agencyId);
});