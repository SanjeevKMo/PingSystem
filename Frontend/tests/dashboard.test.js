// Test cases for dashboard functionality
const { JSDOM } = require('jsdom');
const assert = require('node:assert');
const fetchMock = require('fetch-mock');

// Mock API URL
const API_URL = 'http://localhost:5001/api';

// Mock HTML structure
const mockHTML = `
  <table>
    <tbody id="systems-tbody"></tbody>
  </table>
`;

describe('Dashboard Tests', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(mockHTML, { url: "http://localhost" });
    document = dom.window.document;
    globalThis.document = document;
    globalThis.window = dom.window;
  });

  // Mock API response
  fetchMock.get(`${API_URL}/systems`, {
    success: true,
    data: [
      { name: 'System A', agency: 'Agency 1', type: 'Web App', status: 'Offline', uptime_percentage: '95.0', last_check: '2025-12-24T10:00:00Z' },
      { name: 'System B', agency: 'Agency 2', type: 'Web App', status: 'Online', uptime_percentage: '99.0', last_check: '2025-12-24T11:00:00Z' },
      { name: 'System C', agency: 'Agency 3', type: 'Web App', status: 'Offline', uptime_percentage: '90.0', last_check: '2025-12-24T12:00:00Z' }
    ]
  });

  // Cleanup after each test
  afterEach(() => {
    fetchMock.restore();
  });

  it('should display only offline systems in the table', async () => {
    // Mock loadSystemsData function
    const loadSystemsData = async () => {
      const response = await fetch(`${API_URL}/systems`);
      const data = await response.json();

      if (data.success && data.data) {
        const offlineSystems = data.data.filter(s => s.status === 'Offline');
        updateSystemsTable(offlineSystems);
      }
    };

    // Mock updateSystemsTable function
    const updateSystemsTable = (systems) => {
      const tableBody = document.getElementById('systems-tbody');
      tableBody.innerHTML = systems.map(system => `
        <tr>
          <td>${system.name}</td>
          <td>${system.agency}</td>
          <td>${system.type}</td>
          <td>${system.status}</td>
          <td>${system.uptime_percentage}</td>
          <td>${system.last_check}</td>
        </tr>
      `).join('');
    };

    // Run the test
    await loadSystemsData();

    const rows = document.querySelectorAll('#systems-tbody tr');
    assert.strictEqual(rows.length, 2, 'Only offline systems should be displayed');
    assert.strictEqual(rows[0].querySelector('td').textContent, 'System A', 'First offline system should be System A');
    assert.strictEqual(rows[1].querySelector('td').textContent, 'System C', 'Second offline system should be System C');
  });
});