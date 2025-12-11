/**
 * Utility Functions for Modern Design System
 */

// Sidebar Toggle Functionality
class SidebarManager {
  constructor() {
    this.sidebar = document.querySelector('.agency-sidebar');
    this.toggleBtn = document.getElementById('sidebar-toggle-btn') || 
                     document.getElementById('sidebar-mobile-toggle');
    this.isCollapsed = false;
    this.init();
  }

  init() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }

    // Close sidebar when clicking outside on mobile
    if (window.innerWidth <= 768) {
      document.addEventListener('click', (e) => {
        if (this.sidebar && !this.sidebar.contains(e.target) && 
            !this.toggleBtn?.contains(e.target) &&
            this.sidebar.classList.contains('active')) {
          this.close();
        }
      });
    }
  }

  toggle() {
    if (this.sidebar) {
      this.sidebar.classList.toggle('active');
      this.isCollapsed = !this.isCollapsed;
    }
  }

  open() {
    if (this.sidebar) {
      this.sidebar.classList.add('active');
      this.isCollapsed = false;
    }
  }

  close() {
    if (this.sidebar) {
      this.sidebar.classList.remove('active');
      this.isCollapsed = true;
    }
  }
}

// Modal Manager
class ModalManager {
  constructor() {
    this.modals = {};
    this.init();
  }

  init() {
    // Register all modals
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      const id = overlay.id;
      this.modals[id] = overlay;
    });

    // Close button handlers
    document.querySelectorAll('.modal-close').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const modalId = btn.getAttribute('data-modal');
        if (modalId) {
          this.close(modalId);
        }
      });
    });

    // Overlay click to close
    Object.values(this.modals).forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close(modal.id);
        }
      });
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAll();
      }
    });
  }

  open(modalId) {
    if (this.modals[modalId]) {
      this.modals[modalId].classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  close(modalId) {
    if (this.modals[modalId]) {
      this.modals[modalId].classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  closeAll() {
    Object.keys(this.modals).forEach((modalId) => {
      this.close(modalId);
    });
  }
}

// Toast Notification System
class ToastManager {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: calc(var(--header-height, 70px) + 20px);
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
  }

  show(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.style.cssText = `
      margin-bottom: 10px;
      animation: slideDown var(--transition-base);
    `;
    toast.textContent = message;

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'slideUp 300ms ease-out forwards';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  }

  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'danger', duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }
}

// Responsive Navigation
class ResponsiveNav {
  constructor() {
    this.init();
  }

  init() {
    // Handle mobile menu toggle
    const toggleBtn = document.getElementById('sidebar-mobile-toggle');
    const sidebar = document.querySelector('.agency-sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });

      // Show toggle on mobile
      window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
          toggleBtn.style.display = 'inline-block';
        } else {
          toggleBtn.style.display = 'none';
          sidebar.classList.remove('active');
        }
      });

      // Check initial size
      if (window.innerWidth <= 768) {
        toggleBtn.style.display = 'inline-block';
      }
    }
  }
}

// Form Validator
class FormValidator {
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach((input) => {
      if (!this.validateInput(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  static validateInput(input) {
    const value = input.value.trim();

    // Required field
    if (input.hasAttribute('required') && !value) {
      this.showError(input, 'This field is required');
      return false;
    }

    // Email validation
    if (input.type === 'email' && value && !this.validateEmail(value)) {
      this.showError(input, 'Please enter a valid email');
      return false;
    }

    // URL validation
    if (input.type === 'url' && value && !this.validateURL(value)) {
      this.showError(input, 'Please enter a valid URL');
      return false;
    }

    this.clearError(input);
    return true;
  }

  static showError(input, message) {
    input.classList.add('error');
    let errorEl = input.parentElement.querySelector('.form-error');

    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      input.parentElement.appendChild(errorEl);
    }

    errorEl.textContent = message;
  }

  static clearError(input) {
    input.classList.remove('error');
    const errorEl = input.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.remove();
    }
  }
}

// API Client
class APIClient {
  constructor(baseURL = 'http://localhost:5001/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  handleResponse(response) {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
}

// Data Formatter
class DataFormatter {
  static formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static formatUptime(percentage) {
    if (percentage >= 99.5) return `${percentage.toFixed(1)}% ✓`;
    if (percentage >= 95) return `${percentage.toFixed(1)}% ⚠`;
    return `${percentage.toFixed(1)}% ✕`;
  }

  static getStatusBadge(status) {
    if (status === 'online' || status === 'up') {
      return '<span class="badge badge-success">Online</span>';
    }
    return '<span class="badge badge-danger">Offline</span>';
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all utilities
  window.sidebarManager = new SidebarManager();
  window.modalManager = new ModalManager();
  window.toastManager = new ToastManager();
  window.responsiveNav = new ResponsiveNav();
  window.apiClient = new APIClient();
});

// Add slide animations to CSS if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-10px);
      opacity: 0;
    }
  }

  .form-input.error,
  .form-textarea.error,
  .form-select.error {
    border-color: var(--color-danger) !important;
  }

  .form-error {
    color: var(--color-danger);
    font-size: var(--text-xs);
    margin-top: var(--space-1);
  }
`;
document.head.appendChild(style);
