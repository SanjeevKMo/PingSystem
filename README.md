# Government Systems Monitoring Dashboard

A comprehensive monitoring system for government services and agencies with dynamic agency management, real-time system health checks, and an intuitive admin panel.

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Frontend](#frontend)
- [Backend](#backend)
- [Admin Features](#admin-features)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Dashboard
- **Real-time System Monitoring**: View all government systems across agencies
- **Dynamic Agency Display**: Agency cards load from backend API
- **System Status Overview**: See total systems, up, and down counts
- **Alert Notifications**: Receive alerts for down systems
- **Pie Chart Analytics**: Visual representation of system health

### Dynamic Agency Pages
- **Single Page for All Agencies**: `agency.html?agency_id=<id>` dynamically loads data
- **Agency Details**: Display name, description, icon, color, contact info
- **Systems List**: Show all systems under each agency with status and uptime
- **Real-time Data**: All data fetched from backend API

### Admin Panel
- **Login System**: Secure admin authentication with JWT tokens
- **Agency Management**:
  - ✅ Create new agencies (name, description, icon, color, contact info)
  - ✅ Edit existing agencies
  - ✅ Delete agencies (with validation - cannot delete agencies with systems)
  - ✅ View all agencies in a table
- **System Management**:
  - ✅ Create new systems
  - ✅ Edit existing systems
  - ✅ Delete systems
  - ✅ Assign systems to agencies dynamically
- **Real-time Updates**: Newly created agencies appear immediately in dropdowns

### Backend
- **REST API**: Full CRUD operations for agencies and systems
- **Authentication**: JWT-based admin authentication
- **Health Checks**: Automated system health monitoring every 5 minutes
- **Database**: MySQL with connection pooling
- **CORS Support**: Cross-origin requests from frontend

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Port 9090)                   │
│  HTML/CSS/JS - Served via Python HTTP Server            │
│                                                          │
│  ├── Dashboard (index.html)                             │
│  ├── Admin Login (admin-login.html)                     │
│  ├── Admin Panel (admin-systems.html)                   │
│  └── Agency Detail (agency.html?agency_id=...)          │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP Requests
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (Port 5001)                      │
│  Express.js Server with REST API                        │
│                                                          │
│  ├── /api/agencies      (CRUD)                          │
│  ├── /api/systems       (CRUD)                          │
│  ├── /api/auth          (Login)                         │
│  └── /api/health        (Status)                        │
└─────────────────┬───────────────────────────────────────┘
                  │ SQL Queries
                  ▼
┌─────────────────────────────────────────────────────────┐
│              MySQL Database (system_monitor)            │
│                                                          │
│  ├── agencies table     (agency details)                │
│  ├── systems table      (system details)                │
│  ├── user table         (admin authentication)          │
│  └── downtime table     (outage history)                │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v14+ (for backend)
- **Python 3** (for frontend server)
- **MySQL 5.7+** (database)

### 1. Start Backend (Terminal 1)

```bash
cd Backend
node src/index.js
```

**Expected Output:**
```
✅ MySQL Database Connected Successfully
✅ Database connected

╔════════════════════════════════════════════╗
║   Government Systems Monitor - Backend     ║
║   Server running on http://localhost:5001   ║
║   Environment: development                   ║
╚════════════════════════════════════════════╝
```

### 2. Start Frontend (Terminal 2)

```bash
cd Frontend
python3 -m http.server 9090
```

**Expected Output:**
```
Serving HTTP on :: port 9090 (http://[::]:9090/) ...
```

### 3. Open in Browser

```
http://localhost:9090/HTML/index.html
```

---

## 📁 Project Structure

```
GovSys2/
├── Backend/
│   ├── src/
│   │   ├── index.js                    # Main server
│   │   ├── api/
│   │   │   ├── routes.js               # API route definitions
│   │   │   ├── agencies.js             # Agency CRUD operations
│   │   │   ├── systems.js              # System CRUD operations
│   │   │   └── auth.js                 # Authentication endpoints
│   │   ├── config/
│   │   │   └── database.js             # Configuration (DB, server, CORS, JWT)
│   │   ├── middlewares/
│   │   │   └── auth.js                 # JWT verification middleware
│   │   ├── services/
│   │   │   ├── scheduler.js            # Health check scheduler
│   │   │   ├── healthCheck.js          # System health checker
│   │   │   └── uptimeCalculator.js     # Uptime percentage calc
│   │   └── utils/                      # Utility functions
│   ├── database/
│   │   ├── connection.js               # MySQL pool connection
│   │   ├── init-db.js                  # Database initialization
│   │   ├── create-agencies-table.js    # Agency table creation
│   │   ├── create-downtime-table.js    # Downtime table creation
│   │   └── setup-admin.js              # Admin user creation
│   ├── .env                            # Environment variables (not in git)
│   ├── package.json                    # Dependencies
│   └── README.md                       # Backend documentation
│
├── Frontend/
│   ├── HTML/
│   │   ├── index.html                  # Dashboard
│   │   ├── admin-login.html            # Admin login
│   │   ├── admin-systems.html          # Admin panel (agencies + systems)
│   │   └── agency.html                 # Dynamic agency detail page
│   ├── JS/
│   │   ├── dashboard.js                # Dashboard logic
│   │   ├── admin-systems.js            # Admin panel logic
│   │   └── agency-dynamic.js           # Agency page logic
│   ├── CSS/
│   │   └── styles.css                  # Global styles
│   └── ASSETS/                         # Images and icons
│
└── README.md                           # This file
```

---

## 🎨 Frontend

### Pages

#### Dashboard (`index.html`)
- Displays all agencies as interactive buttons
- Shows system health summary (total, up, down)
- Pie chart of system health status
- Alerts for down systems
- Click agency buttons to view details

**Tech**: Vanilla JavaScript, HTML, CSS
**API Used**: `GET /api/agencies`, `GET /api/systems`

#### Agency Detail (`agency.html?agency_id=<id>`)
- Dynamic page that loads agency data by ID from URL param
- Shows agency header, description, icon, color
- System stats (total, up, down)
- Detailed systems table with status, uptime, last check
- No hardcoded data - 100% dynamic

**Tech**: Vanilla JavaScript, HTML, CSS
**API Used**: `GET /api/agencies/:id`
**Example URLs**:
```
http://localhost:9090/HTML/agency.html?agency_id=1
http://localhost:9090/HTML/agency.html?agency_id=7
```

#### Admin Login (`admin-login.html`)
- Simple login form for admin authentication
- Default credentials: `admin` / `password123`
- JWT token stored in `localStorage.authToken`
- Redirects to admin panel on successful login

**Tech**: Vanilla JavaScript, HTML, CSS
**API Used**: `POST /api/auth/login`

#### Admin Panel (`admin-systems.html`)
- **Create Agency**: Form to add new agencies
  - Fields: Name, Description, Icon (emoji or URL), Color, Email, Phone
  - Button: "Create Agency"
  - Result: Agency added to DB and appears in agencies table + system dropdowns
  
- **Agencies Table**: List all agencies with Edit/Delete buttons
  - Shows: Name, Contact, System Count, Actions
  - Edit: Opens modal to update agency details
  - Delete: Removes agency (fails if agency has systems)

- **Create System**: Form to add systems to agencies
  - Fields: Name, Type, Agency (dropdown), URL, Status
  - Button: "Add System"
  - Result: System added and appears in systems table

- **Systems Table**: List all systems with Edit/Delete buttons
  - Shows: Name, Type, Agency, URL, Status, Uptime, Last Check
  - Edit: Opens modal to update system details
  - Delete: Removes system

**Tech**: Vanilla JavaScript, HTML, CSS
**Auth Required**: JWT token in `localStorage.authToken`
**API Used**: 
- `GET /api/agencies`
- `POST /api/agencies`
- `PUT /api/agencies/:id`
- `DELETE /api/agencies/:id`
- `GET /api/systems`
- `POST /api/systems`
- `PUT /api/systems/:id`
- `DELETE /api/systems/:id`

### API URL Configuration

Frontend files use hardcoded API base URL for development:
```javascript
const API_URL = 'http://localhost:5001/api';
```

This is set in:
- `JS/dashboard.js`
- `JS/admin-systems.js`
- `JS/agency-dynamic.js`
- `HTML/admin-login.html`

To change the backend URL, update the `API_URL` constant in these files.

---

## 🔧 Backend

### Technology Stack
- **Framework**: Express.js
- **Database**: MySQL 5.7+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Task Scheduling**: node-cron
- **HTTP Requests**: axios (for health checks)

### Environment Setup

Create `.env` file in `Backend/` folder:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=system_monitor

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Current Config** (`Backend/.env`):
```env
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Sk@do0$h
DB_NAME=system_monitor
JWT_SECRET=gov-systems-monitor-secret-key-2025
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### CORS Configuration

The backend allows CORS requests from:
- `http://localhost:3000`, `5000`, `5001`, `8080`, `9090`
- `http://127.0.0.1:3000`, `5000`, `5001`, `8080`, `9090`
- Requests without origin (curl, CLI)

Configured in `Backend/src/config/database.js`:
```javascript
cors: {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:8080',
      'http://localhost:9090',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5001',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:9090'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}
```

---

## 🔐 Admin Features

### Default Admin Credentials
```
Username: admin
Password: password123
```

To change admin password, run:
```bash
cd Backend
node database/setup-admin.js
```

Edit the password in the script before running.

### Agency Management Flow

1. **Create Agency**:
   - Admin fills form and submits
   - Frontend calls `POST /api/agencies` with admin JWT token
   - Backend validates and inserts into DB
   - Frontend refreshes agencies list and system dropdowns
   - New agency appears in:
     - Agencies table on admin page
     - System creation dropdown
     - Dashboard (after refresh)

2. **Edit Agency**:
   - Admin clicks "Edit" next to agency in table
   - Modal opens with prefilled data from `GET /api/agencies/:id`
   - Admin modifies fields
   - Submits via `PUT /api/agencies/:id`
   - Frontend refreshes list

3. **Delete Agency**:
   - Admin clicks "Delete" next to agency
   - Confirmation dialog appears
   - Frontend calls `DELETE /api/agencies/:id`
   - Backend checks if agency has systems (fails if it does)
   - On success, agency removed from DB and table

### System Management Flow

Similar to agencies:
1. Create system with `POST /api/systems` → select agency from dropdown (refreshed dynamically)
2. Edit system with `PUT /api/systems/:id`
3. Delete system with `DELETE /api/systems/:id`

---

## 📡 API Endpoints

### Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@system-monitor.gov",
    "role": "admin"
  }
}
```

### Agencies

#### List All Agencies
```
GET /api/agencies

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ministry of Health",
      "description": "Government health services",
      "icon_emoji": "🏥",
      "icon_url": null,
      "color_code": "#28a745",
      "contact_email": "info@health.gov",
      "contact_phone": "+1-555-0101",
      "systems_count": 16,
      "systems_up": 15,
      "systems_down": 1,
      "created_at": "2025-12-11T04:20:53.000Z",
      "updated_at": "2025-12-11T04:22:34.000Z"
    }
  ],
  "count": 1
}
```

#### Get Agency by ID (with Systems)
```
GET /api/agencies/:id

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ministry of Health",
    "description": "Government health services",
    "icon_emoji": "🏥",
    "icon_url": null,
    "color_code": "#28a745",
    "contact_email": "info@health.gov",
    "contact_phone": "+1-555-0101",
    "systems_count": 16,
    "systems_up": 15,
    "systems_down": 1,
    "systems": [
      {
        "id": 19,
        "name": "System A",
        "type": "Web Server",
        "agency": "Ministry of Health",
        "agency_id": 1,
        "url": "http://example.com",
        "status": "Up",
        "uptime_percentage": "100.00",
        "last_check": "2025-12-11T05:55:30.000Z",
        "created_at": "2025-12-10T08:16:10.000Z"
      }
    ]
  }
}
```

#### Create Agency (Admin Only)
```
POST /api/agencies
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "New Agency",
  "description": "Agency description",
  "icon_emoji": "🚀",
  "icon_url": "https://example.com/icon.png",
  "color_code": "#FF6B6B",
  "contact_email": "admin@agency.gov",
  "contact_phone": "+1-555-9999"
}

Response:
{
  "success": true,
  "message": "Agency created successfully",
  "data": {
    "id": 7,
    "name": "New Agency",
    ...
  }
}
```

#### Update Agency (Admin Only)
```
PUT /api/agencies/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Updated Agency Name",
  "color_code": "#4ECDC4",
  ...
}

Response:
{
  "success": true,
  "message": "Agency updated successfully"
}
```

#### Delete Agency (Admin Only)
```
DELETE /api/agencies/:id
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "message": "Agency deleted successfully"
}

Error (if agency has systems):
{
  "success": false,
  "message": "Cannot delete agency with 5 system(s). Please reassign systems first."
}
```

### Systems

#### List All Systems
```
GET /api/systems

Response:
{
  "success": true,
  "data": [
    {
      "id": 36,
      "name": "System Name",
      "type": "Web Portal",
      "agency": "Agency Name",
      "url": "https://example.com",
      "status": "Up",
      "uptime_percentage": "100.00",
      "last_check": "2025-12-11T06:20:30.000Z",
      "created_at": "2025-12-10T13:21:49.000Z"
    }
  ],
  "count": 30
}
```

#### Create System (Admin Only)
```
POST /api/systems
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "System Name",
  "type": "Web Server",
  "agency": "Ministry of Health",
  "url": "https://example.com/health",
  "status": "Up"
}

Response:
{
  "success": true,
  "message": "System created successfully",
  "data": {
    "id": 100,
    ...
  }
}
```

### Health Check

```
GET /api/health

Response:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-11T06:27:40.793Z"
}
```

---

## 🗄️ Database Schema

### Agencies Table
```sql
CREATE TABLE agencies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_emoji VARCHAR(10),
  icon_url VARCHAR(500),
  color_code VARCHAR(7) DEFAULT '#667eea',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Systems Table
```sql
CREATE TABLE systems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  agency VARCHAR(255),
  agency_id INT,
  url VARCHAR(500),
  status ENUM('Up', 'Down', 'Maintenance') DEFAULT 'Up',
  uptime_percentage DECIMAL(5, 2) DEFAULT 100.00,
  last_check TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agency_id) REFERENCES agencies(id)
);
```

### Users Table
```sql
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Downtime Table
```sql
CREATE TABLE downtime (
  id INT PRIMARY KEY AUTO_INCREMENT,
  system_id INT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_minutes INT,
  reason TEXT,
  FOREIGN KEY (system_id) REFERENCES systems(id)
);
```

---

## 🔄 Automated Health Checks

The backend runs automated health checks every 5 minutes:

**Scheduler**: `node-cron` (every 5 minutes)
**Service**: `Backend/src/services/scheduler.js`
**Health Checker**: `Backend/src/services/healthCheck.js`

Each health check:
1. Fetches all systems from DB
2. Makes HTTP request to system URL
3. Logs response time and status
4. Updates `status` and `last_check` in DB
5. Calculates uptime percentage

---

## 🛠️ Troubleshooting

### Issue: "Could not connect to the server" (CORS Error)

**Problem**: Frontend on `localhost:9090` cannot reach backend on `localhost:5001`

**Solution**:
1. Verify backend is running: `curl http://localhost:5001/api/health`
2. Check CORS config in `Backend/src/config/database.js`
3. Ensure frontend port (9090) is in `allowedOrigins` list
4. Restart backend: `node src/index.js`

### Issue: "Failed to load resource: agencies" in Console

**Problem**: API returns 404 or 500 error

**Solution**:
1. Check backend logs: `tail -f /tmp/backend.log`
2. Verify database is running: `mysql -u root -p`
3. Check API URL in frontend JS files - should be `http://localhost:5001/api`
4. Test endpoint manually: `curl http://localhost:5001/api/agencies`

### Issue: Cards show "Loading..." forever

**Problem**: API requests are failing

**Solution**:
1. Open browser DevTools (F12) → Console tab
2. Check for error messages
3. Check Network tab for failed requests
4. Verify backend is responding to API calls
5. Hard refresh page (Ctrl+Shift+R)

### Issue: Admin login doesn't work

**Problem**: Username/password incorrect or token not stored

**Solution**:
1. Default credentials: `admin` / `password123`
2. Check `localStorage.authToken` in browser DevTools (F12 → Application → Storage → Local Storage)
3. Try resetting admin password: `cd Backend && node database/setup-admin.js`
4. Check backend logs for auth errors

### Issue: Cannot create/edit agencies

**Problem**: Not logged in or token expired

**Solution**:
1. Make sure you're logged in (check `localStorage.authToken`)
2. Token expires after 24 hours - login again
3. Check browser console for API errors
4. Verify Authorization header is being sent in requests

---

## 📝 Notes

### Frontend Simplifications
- No build step (Webpack/Vite) - vanilla JavaScript, HTML, CSS
- No package manager for frontend - all via CDN or inline
- Easy to modify and deploy

### Backend Dependencies
```json
{
  "axios": "^1.13.2",
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "mysql2": "^3.15.3",
  "node-cron": "^4.2.1"
}
```

### Future Improvements
- [ ] Serve frontend from backend (Express static middleware)
- [ ] Add email notifications for system downs
- [ ] Add system edit modal to admin page
- [ ] Add user role-based access control (RBAC)
- [ ] Add audit logging
- [ ] Add dashboard refresh rate controls
- [ ] Add downtime reports/history view
- [ ] Add system dependency mapping
- [ ] Add performance metrics and trending

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `tail -f /tmp/backend.log`
3. Check browser console errors (F12)
4. Verify all services are running on correct ports

---

**Last Updated**: December 11, 2025
**Version**: 1.0.0
**Status**: ✅ Fully Functional
