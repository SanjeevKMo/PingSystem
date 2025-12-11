# Design System Quick Reference

## Color Palette

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary | #667eea | `--color-primary` | Main buttons, links, accents |
| Secondary | #764ba2 | `--color-secondary` | Gradients, hover states |
| Success | #10b981 | `--color-success` | Online status, success messages |
| Danger | #ef4444 | `--color-danger` | Offline status, errors, delete |
| Warning | #f59e0b | `--color-warning` | Warnings, cautions |
| Info | #3b82f6 | `--color-info` | Information messages |

## Quick Copy-Paste Components

### Header
```html
<header>
  <div class="header-logo">
    <div class="header-logo-icon">🛡️</div>
    <span>AppName</span>
  </div>
  <nav class="header-nav">
    <a href="#" class="active">Dashboard</a>
    <a href="#">Systems</a>
    <a href="#">Agencies</a>
  </nav>
  <div class="header-actions">
    <a href="#" class="btn btn-secondary btn-sm">Login</a>
  </div>
</header>
```

### Stat Card
```html
<div class="card stat-card">
  <div class="stat-value">99.9%</div>
  <div class="stat-label">System Uptime</div>
  <div class="stat-change positive">↑ 0.5%</div>
</div>
```

### Status Badge
```html
<!-- Online -->
<span class="status-online">✓ Online</span>

<!-- Offline -->
<span class="status-offline">✕ Offline</span>

<!-- Custom Badge -->
<span class="badge badge-success">Active</span>
```

### Card with Actions
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Agency Name</h3>
  </div>
  <p>Agency description goes here.</p>
  <div class="card-footer">
    <button class="btn btn-secondary btn-sm">Edit</button>
    <button class="btn btn-danger btn-sm">Delete</button>
  </div>
</div>
```

### Modal
```html
<div class="modal-overlay" id="confirm-modal">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">Confirm Action</h2>
      <button class="modal-close" data-modal="confirm-modal">✕</button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to continue?</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-modal="confirm-modal">Cancel</button>
      <button class="btn btn-danger">Delete</button>
    </div>
  </div>
</div>

<script>
  document.getElementById('open-btn').addEventListener('click', () => {
    window.modalManager.open('confirm-modal');
  });
</script>
```

### Form
```html
<form id="myForm">
  <div class="form-group">
    <label class="form-label">Username</label>
    <input type="text" class="form-input" name="username" required>
  </div>

  <div class="form-group">
    <label class="form-label">Email</label>
    <input type="email" class="form-input" name="email" required>
  </div>

  <div class="form-group">
    <label class="form-label">Message</label>
    <textarea class="form-textarea" name="message"></textarea>
  </div>

  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### Grid Layouts
```html
<!-- 2-column grid (responsive) -->
<div class="grid grid-2">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
</div>

<!-- 3-column grid (responsive) -->
<div class="grid grid-3">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>

<!-- 4-column grid (responsive) -->
<div class="grid grid-4">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
  <div class="card">Item 4</div>
</div>
```

### Table
```html
<div class="table-wrapper">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Uptime</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>System 1</td>
        <td><span class="status-online">✓ Online</span></td>
        <td>99.9%</td>
        <td>
          <button class="btn btn-sm btn-secondary">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## JavaScript Utilities

### Toast Notifications
```javascript
// Success
window.toastManager.success('Saved successfully');

// Error
window.toastManager.error('Failed to save');

// Warning
window.toastManager.warning('Please review');

// Info
window.toastManager.info('Information');

// Custom duration (in milliseconds)
window.toastManager.success('Message', 3000);
```

### API Calls
```javascript
const api = window.apiClient;

// GET request
const agencies = await api.get('/agencies');

// POST request
const newSystem = await api.post('/systems', {
  name: 'New System',
  type: 'API',
  agency_id: 1
});

// PUT request
await api.put('/systems/1', { name: 'Updated Name' });

// DELETE request
await api.delete('/systems/1');
```

### Modal Management
```javascript
// Open modal
window.modalManager.open('my-modal');

// Close modal
window.modalManager.close('my-modal');

// Close all modals
window.modalManager.closeAll();
```

### Form Validation
```javascript
// Validate single input
FormValidator.validateInput(inputElement);

// Validate entire form
if (FormValidator.validateForm(document.getElementById('myForm'))) {
  console.log('Form is valid');
}

// Custom validation
if (!FormValidator.validateEmail('user@example.com')) {
  console.log('Invalid email');
}
```

### Data Formatting
```javascript
// Format date
DataFormatter.formatDate('2024-01-15');
// Output: "Jan 15, 2024, 02:30 PM"

// Format uptime
DataFormatter.formatUptime(99.5);
// Output: "99.5% ✓"

// Get status badge HTML
DataFormatter.getStatusBadge('online');
// Output: '<span class="badge badge-success">Online</span>'

// Format bytes
DataFormatter.formatBytes(1024000);
// Output: "1000 KB"

// Debounce function
const debouncedSearch = DataFormatter.debounce((query) => {
  // Search logic
}, 300);
```

### Sidebar Management
```javascript
const sidebar = window.sidebarManager;

// Toggle sidebar
sidebar.toggle();

// Open sidebar
sidebar.open();

// Close sidebar
sidebar.close();
```

## CSS Utilities

### Text Alignment
```html
<div class="text-center">Centered text</div>
<div class="text-right">Right-aligned text</div>
```

### Spacing
```html
<div class="mt-4">Margin top</div>
<div class="mb-4">Margin bottom</div>
<div class="mb-8">Large margin bottom</div>
<div class="p-4">Padding all sides</div>
<div class="p-6">More padding</div>
```

### Flexbox
```html
<div class="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div class="flex-between">
  <div>Left</div>
  <div>Right</div>
</div>

<div class="flex-center">
  <div>Centered</div>
</div>
```

## Spacing Scale

| Variable | Value |
|----------|-------|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |

## Typography Scale

| Class | Size | Use Case |
|-------|------|----------|
| `--text-xs` | 0.75rem | Help text, small labels |
| `--text-sm` | 0.875rem | Secondary text, form labels |
| `--text-base` | 1rem | Body text, default |
| `--text-lg` | 1.125rem | Larger body text |
| `--text-xl` | 1.25rem | Subheadings |
| `--text-2xl` | 1.5rem | Section titles |
| `--text-3xl` | 1.875rem | Page titles |
| `--text-4xl` | 2.25rem | Hero titles |

## Common Patterns

### Loading State
```html
<div class="empty-state">
  <div class="loading-spinner"></div>
  <p>Loading data...</p>
</div>
```

### Empty State
```html
<div class="empty-state">
  <div class="empty-state-icon">📭</div>
  <h3 class="empty-state-title">No Data Found</h3>
  <p class="empty-state-text">There are no items to display.</p>
  <button class="btn btn-primary">Add New Item</button>
</div>
```

### Alert Message
```html
<div class="alert alert-success">
  ✓ Changes saved successfully
</div>

<div class="alert alert-danger">
  ✕ An error occurred, please try again
</div>

<div class="alert alert-warning">
  ⚠ Please review before proceeding
</div>
```

### Responsive Grid
```html
<div class="grid grid-3">
  <!-- Automatically becomes 2 columns on tablet -->
  <!-- Automatically becomes 1 column on mobile -->
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
</div>
```

## Animation Classes

```css
/* Slide Down (alerts) */
animation: slideDown var(--transition-base);

/* Slide Up (toast close) */
animation: slideUp var(--transition-base);

/* Pulse (status indicator) */
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

/* Spin (loading) */
animation: spin 1s linear infinite;
```

## Responsive Design Tips

```javascript
// Check screen size in JavaScript
if (window.innerWidth <= 768) {
  // Mobile layout
} else {
  // Desktop layout
}

// Listen for resize
window.addEventListener('resize', () => {
  // Adjust layout
});
```

## Best Practices

✅ **Do:**
- Use CSS variables for consistency
- Follow the spacing scale
- Use semantic HTML
- Test on mobile devices
- Use the utility classes
- Keep components modular

❌ **Don't:**
- Hardcode colors (use CSS variables)
- Use inline styles
- Skip responsive design
- Ignore accessibility
- Create custom animations (use provided ones)

## Support Classes Reference

```css
.container          /* Max-width container centered */
.grid-2/-3/-4       /* Responsive grid layouts */
.flex               /* Flexbox container */
.flex-between       /* Flex with space-between */
.flex-center        /* Flex centered */
.text-center        /* Center aligned text */
.text-right         /* Right aligned text */
.mt-4/mb-4/mb-8     /* Margin utilities */
.p-4/p-6            /* Padding utilities */
.gap-4/gap-6        /* Gap utilities */
```

## Browser DevTools Tip

All colors and spacing are CSS variables. Inspect an element and search for `--color-` or `--space-` in the computed styles to see all available values.

## Version Information

- Design System v1.0
- Based on modern UI/UX principles
- Production-ready
- Cross-browser compatible
- Mobile-first responsive design
