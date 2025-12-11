# Quick Start Guide

## Step 1: Setup Database (First Time Only)

Run the initialization script to create all tables:

```bash
cd Backend
node database/init-db.js
```

Expected output:
```
=== Initializing Database ===

✓ Database 'system_monitor' ensured
✓ User table created
✓ Systems table created
✓ Audit logs table created

✓ Database initialization completed!
```

## Step 2: Create Admin User

Run the admin setup script:

```bash
node database/setup-admin.js
```

Expected output:
```
=== Admin User Setup ===

Username: admin
Password: password123
Hashed Password: $2a$10$...

✓ Admin user created successfully!

You can now login with:
- Username: admin
- Password: password123
```

## Step 3: Start Backend Server

```bash
npm run dev
```

Expected output:
```
✓ MySQL Database Connected Successfully

╔════════════════════════════════════════════╗
║   Government Systems Monitor - Backend     ║
║   Server running on http://localhost:5000  ║
║   Environment: development                 ║
╚════════════════════════════════════════════╝
```

## Step 4: Test Backend (Optional)

### Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

### Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

You should get back a JWT token.

## Step 5: Test Frontend Login

1. Open `Frontend/HTML/admin-login.html` in a browser
2. Make sure backend is running on localhost:5000
3. Enter credentials:
   - Username: `admin`
   - Password: `password123`
4. Click "Login"
5. You should be redirected to the admin panel

## Troubleshooting

### Error: "Connection refused"
- Make sure MySQL is running
- Verify database name in `.env`

### Error: "Access denied for user"
- Check DB_USER and DB_PASSWORD in `.env`

### Error: "Database initialization error"
- Make sure you have MySQL running
- Check your database credentials

### Frontend shows "Connection error"
- Ensure backend is running on port 5000
- Check if CORS_ORIGIN in `.env` allows your frontend

## Next: Create More Database Tables

Add tables for systems, notifications, and logs:

```sql
USE system_monitor;

-- Systems table
INSERT INTO systems (name, type, agency, status, uptime_percentage) VALUES
('File Storage', 'Storage', 'Agency B', 'Down', 88.3),
('DNS Server A', 'DNS', 'Agency A', 'Down', 92.1),
('Queue Service', 'Message Queue', 'Agency B', 'Down', 85.7),
('Database A', 'Database', 'Agency A', 'Down', 95.2);
```

## Architecture Overview

```
Frontend (HTML/CSS/JS)
        ↓
admin-login.html → sends credentials → backend:5000/api/auth/login
        ↓
receives JWT token
        ↓
stores in localStorage
        ↓
redirects to admin.html
        ↓
admin.html uses token for authenticated requests
```

## Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] JWT tokens for authentication
- [x] Role-based access control
- [ ] Change JWT_SECRET in production
- [ ] Change default password
- [ ] Enable HTTPS in production
- [ ] Add rate limiting
- [ ] Add CSRF protection

## Available npm Scripts

```bash
npm start    # Start production server
npm run dev  # Start with hot-reload (nodemon)
npm test     # Run tests
```

Enjoy your monitoring dashboard! 🚀
