/**
 * Admin Systems Management
 * Handles CRUD operations for systems
 */

const API_URL = 'http://localhost:5001/api';
let currentEditingId = null;
let allSystems = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication - FIXED: Use 'token' to match admin-login.html
  const authToken = localStorage.getItem('token');
  if (!authToken) {
    window.location.href = 'admin-login.html';
    return;
  }

  // Display username
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = user.username || 'Admin';
  }

  // Load systems and agencies
  loadSystems();
  loadAgenciesAdmin();

  // Form submission
  document.getElementById('systemForm').addEventListener('submit', handleAddSystem);
  document.getElementById('editForm').addEventListener('submit', handleUpdateSystem);
  const agencyForm = document.getElementById('agencyForm');
  if (agencyForm) agencyForm.addEventListener('submit', handleAddAgency);

  // Close modal on background click
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') {
      closeEditModal();
    }
  });
  
  // Close agency modal on background click
  const editAgencyModal = document.getElementById('editAgencyModal');
  if (editAgencyModal) {
    editAgencyModal.addEventListener('click', (e) => {
      if (e.target.id === 'editAgencyModal') closeEditAgencyModal();
    });
  }
  
  // Wire edit agency form
  const editAgencyForm = document.getElementById('editAgencyForm');
  if (editAgencyForm) editAgencyForm.addEventListener('submit', handleUpdateAgency);
});

/**
 * Logout function
 * FIXED: Use consistent token name
 */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear all auth data - FIXED: Use 'token' consistently
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect immediately
    window.location.replace('admin-login.html');
  }
}

/**
 * Load agencies (admin view)
 */
async function loadAgenciesAdmin() {
  try {
    const response = await fetch(`${API_URL}/agencies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // FIXED: Use 'token'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load agencies');
    }

    const json = await response.json();
    const agencies = Array.isArray(json.data) ? json.data : [];
    renderAgenciesTable(agencies);
    updateAgencySelectOptions(agencies);
  } catch (err) {
    console.error('Error loading agencies:', err);
  }
}

function renderAgenciesTable(agencies) {
  const container = document.getElementById('agenciesTable');
  if (!container) return;

  if (!agencies || agencies.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔭</div><p>No agencies yet. Create one using the form above.</p></div>`;
    return;
  }

  let html = `<div class="table-wrapper"><table class="table"><thead><tr><th>Name</th><th>Contact</th><th>Systems</th><th>Actions</th></tr></thead><tbody>`;
  agencies.forEach(a => {
    const contact = a.contact_email ? escapeHtml(a.contact_email) : (a.contact_phone ? escapeHtml(a.contact_phone) : 'N/A');
    html += `
      <tr>
        <td><strong>${escapeHtml(a.name)}</strong></td>
        <td style="font-size:12px">${contact}</td>
        <td>${a.systems_count || 0}</td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="openEditAgencyModal(${a.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteAgency(${a.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

/**
 * Open Edit Agency Modal and populate fields
 */
async function openEditAgencyModal(id) {
  try {
    const res = await fetch(`${API_URL}/agencies/${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }  // FIXED
    });
    if (!res.ok) throw new Error('Failed to load agency');
    const json = await res.json();
    const agency = json.data;

    document.getElementById('editAgencyId').value = agency.id;
    document.getElementById('editAgencyName').value = agency.name || '';
    document.getElementById('editAgencyEmoji').value = agency.icon_emoji || '';
    document.getElementById('editAgencyIconUrl').value = agency.icon_url || '';
    document.getElementById('editAgencyColor').value = agency.color_code || '';
    document.getElementById('editAgencyEmail').value = agency.contact_email || '';
    document.getElementById('editAgencyPhone').value = agency.contact_phone || '';
    document.getElementById('editAgencyDescription').value = agency.description || '';

    document.getElementById('editAgencyModal').classList.add('active');
  } catch (err) {
    console.error('Error opening edit agency modal:', err);
    showAlert('Failed to load agency details', 'error');
  }
}

function closeEditAgencyModal() {
  document.getElementById('editAgencyModal').classList.remove('active');
  const form = document.getElementById('editAgencyForm');
  if (form) form.reset();
}

/**
 * Handle update agency (PUT)
 */
async function handleUpdateAgency(e) {
  e.preventDefault();
  const id = document.getElementById('editAgencyId').value;
  const payload = {
    name: document.getElementById('editAgencyName').value,
    description: document.getElementById('editAgencyDescription').value || null,
    icon_emoji: document.getElementById('editAgencyEmoji').value || null,
    icon_url: document.getElementById('editAgencyIconUrl').value || null,
    color_code: document.getElementById('editAgencyColor').value || null,
    contact_email: document.getElementById('editAgencyEmail').value || null,
    contact_phone: document.getElementById('editAgencyPhone').value || null
  };

  try {
    const res = await fetch(`${API_URL}/agencies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // FIXED
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update agency');

    showAlert('Agency updated successfully', 'success');
    closeEditAgencyModal();
    loadAgenciesAdmin();
    updateAgencySelectOptions((await (await fetch(`${API_URL}/agencies`)).json()).data || []);
  } catch (err) {
    console.error('Error updating agency:', err);
    showAlert(err.message || 'Failed to update agency', 'error');
  }
}

/**
 * Handle add agency form
 */
async function handleAddAgency(e) {
  e.preventDefault();
  const form = document.getElementById('agencyForm');
  const fd = new FormData(form);
  const payload = {
    name: fd.get('name'),
    description: fd.get('description') || null,
    icon_emoji: fd.get('icon_emoji') || null,
    icon_url: fd.get('icon_url') || null,
    color_code: fd.get('color_code') || null,
    contact_email: fd.get('contact_email') || null,
    contact_phone: fd.get('contact_phone') || null
  };

  if (!payload.name || payload.name.trim() === '') {
    showAlert('Agency name is required', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/agencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // FIXED
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Failed to create agency');
    }

    showAlert('Agency created successfully', 'success');
    form.reset();
    await loadAgenciesAdmin();
    const allAgencies = await fetch(`${API_URL}/agencies`).then(r => r.json()).then(d => d.data || []);
    updateAgencySelectOptions(allAgencies);
  } catch (err) {
    console.error('Error creating agency:', err);
    showAlert(err.message || 'Failed to create agency', 'error');
  }
}

/**
 * Update agency dropdowns used in system forms
 */
function updateAgencySelectOptions(agencies) {
  const selects = [document.getElementById('systemAgency'), document.getElementById('editSystemAgency')];
  selects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '<option value="">Select Agency</option>';
    agencies.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.name;
      opt.textContent = a.name;
      sel.appendChild(opt);
    });
    const otherOpt = document.createElement('option');
    otherOpt.value = 'Other';
    otherOpt.textContent = 'Other';
    sel.appendChild(otherOpt);
  });
}

/**
 * Delete agency (admin)
 */
async function deleteAgency(id) {
  if (!confirm('Delete this agency? This cannot be undone and will fail if the agency has systems.')) return;
  try {
    const res = await fetch(`${API_URL}/agencies/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }  // FIXED
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete agency');
    showAlert('Agency deleted', 'success');
    await loadAgenciesAdmin();
    const allAgencies = await fetch(`${API_URL}/agencies`).then(r => r.json()).then(d => d.data || []);
    updateAgencySelectOptions(allAgencies);
  } catch (err) {
    console.error('Error deleting agency:', err);
    showAlert(err.message || 'Failed to delete agency', 'error');
  }
}

/**
 * Load all systems from backend
 */
async function loadSystems() {
  try {
    showLoading(true);
    const response = await fetch(`${API_URL}/systems`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // FIXED
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');  // FIXED
        window.location.href = 'admin-login.html';
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    allSystems = data.data || [];
    renderSystemsTable();
    showLoading(false);
  } catch (error) {
    console.error('Error loading systems:', error);
    showAlert('Failed to load systems', 'error');
    showLoading(false);
  }
}

/**
 * Render systems table
 */
function renderSystemsTable() {
  const tableContainer = document.getElementById('systemsTable');

  if (allSystems.length === 0) {
    tableContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔭</div>
        <p>No systems added yet. Create your first system using the form above.</p>
      </div>
    `;
    return;
  }

  let tableHTML = `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Agency</th>
            <th>URL</th>
            <th>Status</th>
            <th>Last Check</th>
            <th>Uptime</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  allSystems.forEach(system => {
    const statusBadge = system.status === 'Up' 
      ? '<span class="badge badge-success">✓ Online</span>'
      : '<span class="badge badge-danger">✕ Offline</span>';
    const lastCheck = system.last_check ? new Date(system.last_check).toLocaleString() : 'N/A';
    const url = system.url ? `<a href="${system.url}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; word-break: break-all;">${system.url}</a>` : 'N/A';

    tableHTML += `
      <tr>
        <td><strong>${escapeHtml(system.name)}</strong></td>
        <td>${escapeHtml(system.type)}</td>
        <td>${escapeHtml(system.agency)}</td>
        <td style="max-width: 200px;">${url}</td>
        <td>${statusBadge}</td>
        <td>${lastCheck}</td>
        <td>${system.uptime_percentage}%</td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="openEditModal(${system.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSystem(${system.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  tableContainer.innerHTML = tableHTML;
}

/**
 * Handle add system form submission
 */
async function handleAddSystem(e) {
  e.preventDefault();

  const formData = new FormData(document.getElementById('systemForm'));
  const systemData = {
    name: formData.get('name'),
    type: formData.get('type'),
    agency: formData.get('agency'),
    url: formData.get('url') || null,
    status: formData.get('status')
  };

  if (!systemData.name || !systemData.type || !systemData.agency) {
    showAlert('Please fill in all required fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/systems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // FIXED
      },
      body: JSON.stringify(systemData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create system');
    }

    showAlert('System created successfully!', 'success');
    document.getElementById('systemForm').reset();
    loadSystems();
  } catch (error) {
    console.error('Error creating system:', error);
    showAlert(error.message || 'Failed to create system', 'error');
  }
}

/**
 * Open edit modal for a system
 */
async function openEditModal(systemId) {
  try {
    const response = await fetch(`${API_URL}/systems/${systemId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // FIXED
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load system details');
    }

    const data = await response.json();
    const system = data.data;

    document.getElementById('editSystemId').value = system.id;
    document.getElementById('editSystemName').value = system.name;
    document.getElementById('editSystemType').value = system.type;
    document.getElementById('editSystemAgency').value = system.agency;
    document.getElementById('editSystemStatus').value = system.status;
    document.getElementById('editSystemUrl').value = system.url || '';

    currentEditingId = system.id;
    document.getElementById('editModal').classList.add('active');
  } catch (error) {
    console.error('Error loading system:', error);
    showAlert('Failed to load system details', 'error');
  }
}

/**
 * Close edit modal
 */
function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
  document.getElementById('editForm').reset();
  currentEditingId = null;
}

/**
 * Handle update system form submission
 */
async function handleUpdateSystem(e) {
  e.preventDefault();

  const systemId = document.getElementById('editSystemId').value;
  const formData = new FormData(document.getElementById('editForm'));
  
  const systemData = {
    name: formData.get('name'),
    type: formData.get('type'),
    agency: formData.get('agency'),
    url: formData.get('url') || null,
    status: formData.get('status')
  };

  try {
    const response = await fetch(`${API_URL}/systems/${systemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // FIXED
      },
      body: JSON.stringify(systemData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update system');
    }

    showAlert('System updated successfully!', 'success');
    closeEditModal();
    loadSystems();
  } catch (error) {
    console.error('Error updating system:', error);
    showAlert(error.message || 'Failed to update system', 'error');
  }
}

/**
 * Delete system
 */
async function deleteSystem(systemId) {
  if (!confirm('Are you sure you want to delete this system?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/systems/${systemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // FIXED
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete system');
    }

    showAlert('System deleted successfully!', 'success');
    loadSystems();
  } catch (error) {
    console.error('Error deleting system:', error);
    showAlert(error.message || 'Failed to delete system', 'error');
  }
}

/**
 * Show alert message
 */
function showAlert(message, type) {
  const alertElement = document.getElementById('alert');
  if (!alertElement) return;
  
  alertElement.textContent = message;
  alertElement.className = `alert alert-${type}`;
  alertElement.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      alertElement.style.display = 'none';
    }, 3000);
  }
}

/**
 * Show/hide loading state
 */
function showLoading(isLoading) {
  const tableContainer = document.getElementById('systemsTable');
  if (isLoading) {
    tableContainer.innerHTML = `
      <div class="loading" style="text-align: center; padding: var(--space-8);">
        <div class="loading-spinner" style="margin: 0 auto var(--space-4);"></div>
        <p>Loading systems...</p>
      </div>
    `;
  }
}

/**
 * Escape HTML special characters
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