# Agency Icons & Images Reference

## Current Setup (Phase 1)

Each agency in the database now has icon support:

### Database Fields

```
icon_emoji   - Single emoji character (🏥, 📚, 🚨)
icon_url     - Full URL to image (optional)
color_code   - Hex color code (#28a745, #007bff, #dc3545)
```

### Built-in Agencies

| Agency | Emoji | Color | Type |
|--------|-------|-------|------|
| Ministry of Health | 🏥 | #28a745 | Hospital |
| MoESD | 📚 | #007bff | Education |
| The PEMA Secretariat | 🚨 | #dc3545 | Emergency |

---

## Icon Implementation Options

### Option 1: Simple Emoji (Recommended for now)

**Pros:** No image files, works everywhere, fast
**Cons:** Limited customization

```html
<div style="font-size: 48px; margin-bottom: 10px;">🏥</div>
<h2>Ministry of Health</h2>
```

**CSS:**
```css
.agency-icon {
  font-size: 3rem;
  display: inline-block;
  margin-right: 10px;
}
```

---

### Option 2: Custom SVG Images

**Pros:** Scalable, customizable, professional
**Cons:** Requires image files

```html
<img src="../ASSETS/icons/health-icon.svg" alt="Ministry of Health" class="agency-icon">
<h2>Ministry of Health</h2>
```

**CSS:**
```css
.agency-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
```

---

### Option 3: Bootstrap Icons

**Pros:** Large library, professional, consistent
**Cons:** Requires CDN/package

Add to HTML `<head>`:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
```

Then use in HTML:
```html
<i class="bi bi-hospital" style="font-size: 3rem;"></i>
<h2>Ministry of Health</h2>
```

---

### Option 4: Font Awesome Icons

**Pros:** Huge icon library, widely used
**Cons:** CDN dependency

Add to HTML `<head>`:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

Then use in HTML:
```html
<i class="fas fa-hospital" style="font-size: 3rem; color: #28a745;"></i>
<h2>Ministry of Health</h2>
```

---

## Implementation for Dynamic Pages

### For `agency.html` (Single Dynamic Page)

The backend will return agency data with icon info:

```javascript
// API Response: GET /api/agencies/1
{
  id: 1,
  name: "Ministry of Health",
  description: "Government health services...",
  icon_emoji: "🏥",
  icon_url: null,
  color_code: "#28a745",
  systems: [...]
}
```

**HTML Template (JavaScript renders):**
```javascript
function renderAgencyHeader(agency) {
  return `
    <div class="agency-header">
      <div class="agency-icon">${agency.icon_emoji}</div>
      <h1>${agency.name}</h1>
      <p>${agency.description}</p>
    </div>
  `;
}
```

**CSS:**
```css
.agency-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-left: 5px solid;
}

.agency-header .agency-icon {
  font-size: 4rem;
  line-height: 1;
}
```

Dynamic color from database:
```javascript
const header = document.querySelector('.agency-header');
header.style.borderColor = agency.color_code;
header.style.backgroundColor = agency.color_code + '15'; // 15% opacity
```

---

## Dashboard Agency Buttons with Icons

### Current HTML (Static)
```html
<a href="agency-a.html" class="btn-agency">Ministry of Health</a>
```

### Future (Dynamic with Icons)
```javascript
// Fetched from API
function renderAgencyButtons(agencies) {
  return agencies.map(agency => `
    <a href="agency.html?agency_id=${agency.id}" 
       class="btn-agency"
       style="border-color: ${agency.color_code}; color: ${agency.color_code};">
      <span class="btn-icon">${agency.icon_emoji}</span>
      ${agency.name}
    </a>
  `).join('');
}
```

**CSS for buttons:**
```css
.btn-agency {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  border: 2px solid;
  transition: all 0.3s ease;
}

.btn-agency:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px currentColor;
}

.btn-icon {
  font-size: 1.5rem;
}
```

---

## Admin Form: Add Icons When Creating Agency

```html
<form id="addAgencyForm">
  <div class="form-group">
    <label>Agency Name</label>
    <input type="text" id="agencyName" required>
  </div>

  <div class="form-group">
    <label>Description</label>
    <textarea id="agencyDescription"></textarea>
  </div>

  <div class="form-group">
    <label>Icon (Emoji)</label>
    <input type="text" id="agencyIcon" placeholder="e.g., 🏥" maxlength="2">
    <small>Paste an emoji here</small>
  </div>

  <div class="form-group">
    <label>Brand Color</label>
    <input type="color" id="agencyColor" value="#007bff">
  </div>

  <div class="form-group">
    <label>Contact Email</label>
    <input type="email" id="agencyEmail">
  </div>

  <div class="form-group">
    <label>Contact Phone</label>
    <input type="tel" id="agencyPhone">
  </div>

  <button type="submit" class="btn btn-primary">Create Agency</button>
</form>
```

**JavaScript:**
```javascript
document.getElementById('addAgencyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const agencyData = {
    name: document.getElementById('agencyName').value,
    description: document.getElementById('agencyDescription').value,
    icon_emoji: document.getElementById('agencyIcon').value,
    color_code: document.getElementById('agencyColor').value,
    contact_email: document.getElementById('agencyEmail').value,
    contact_phone: document.getElementById('agencyPhone').value
  };

  const response = await fetch(`${API_URL}/agencies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(agencyData)
  });

  const result = await response.json();
  if (result.success) {
    alert('Agency created! Refresh dashboard to see it.');
  }
});
```

---

## Recommended Approach (Phase 2+)

**Use emoji + color code** for now because:
- ✅ No additional files needed
- ✅ Works on all devices
- ✅ Fast loading
- ✅ Database already stores emoji and color
- ✅ Can easily upgrade to images later

**Later:** Add icon_url support for custom images (optional enhancement)

---

## Icon Resources

### Emoji Picker
- https://emojipedia.org/
- https://emoji-picker.vercel.app/

### Bootstrap Icons
- https://icons.getbootstrap.com/

### Font Awesome
- https://fontawesome.com/icons

### SVG Icons
- https://www.flaticon.com/
- https://www.heroicons.com/
- https://www.iconmonstr.com/

---

**Status:** Ready for Phase 2 implementation
