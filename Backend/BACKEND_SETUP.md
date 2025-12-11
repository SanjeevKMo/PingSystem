# Government Systems Monitoring Dashboard - Backend Setup

## Overview
Complete Node.js backend with JWT authentication and MySQL database integration.

## Project Structure
```
Backend/
├── database/
│   └── connection.js          # MySQL connection pool
├── src/
│   ├── api/
│   │   ├── auth.js           # Authentication logic
│   │   └── routes.js         # API routes
│   ├── config/
│   │   └── database.js       # Configuration management
│   ├── middlewares/
│   │   └── auth.js           # JWT & error handling middleware
│   └── index.js              # Main server file
├── .env                       # Environment variables (create this)
├── .env.example              # Example environment file
├── package.json              # Dependencies
└── README.md                 # This file
```

## Prerequisites
- Node.js (v14+)
- MySQL Server running
- Database: `system_monitor` created
- User table with admin credentials

## Installation & Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the Backend folder (copy from `.env.example`):

```bash
cp .env.example .env
```

Update `.env` with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=system_monitor
JWT_SECRET=your-secret-key
```

### 3. Database Setup
Ensure you have created the MySQL database and user table:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS system_monitor;
USE system_monitor;

-- Create user table with admin
CREATE TABLE `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(255),
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user (password: password123 hashed with bcrypt)
INSERT INTO `user` (username, email, password, role) VALUES 
('admin', 'admin@system-monitor.gov', '$2a$10$...', 'admin');
```

### 4. Start the Server

**Development (with nodemon):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes

#### 1. Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@system-monitor.gov",
      "role": "admin"
    }
  }
  ```

#### 2. Get Current User
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@system-monitor.gov",
      "role": "admin"
    }
  }
  ```

#### 3. Logout
- **Endpoint:** `POST /api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logout successful."
  }
  ```

#### 4. Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Server is running",
    "timestamp": "2025-12-09T10:30:00.000Z"
  }
  ```

## Frontend Integration

### Login Flow
1. User enters credentials on `admin-login.html`
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials and returns JWT token
4. Token is stored in `localStorage`
5. User is redirected to `admin.html`

### Using Token in Frontend
```javascript
const token = localStorage.getItem('authToken');
const response = await fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## File Descriptions

### `/database/connection.js`
MySQL connection pool with error handling and connection testing.

### `/src/config/database.js`
Centralized configuration management for database, server, JWT, and CORS settings.

### `/src/middlewares/auth.js`
- `verifyToken`: Validates JWT tokens
- `isAdmin`: Checks user role is admin
- `errorHandler`: Global error handling

### `/src/api/auth.js`
Authentication controller with:
- Login validation and JWT generation
- Password verification using bcryptjs
- User information retrieval

### `/src/api/routes.js`
Express routes for authentication and health check endpoints.

### `/src/index.js`
Main server file with Express setup, middleware configuration, and server startup.

## Security Notes
- Passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours (configurable)
- CORS is configured to accept requests from frontend origin
- Token validation on protected routes
- Role-based access control (admin check)

## Troubleshooting

### Database Connection Error
- Verify MySQL is running: `mysql -u root`
- Check database exists: `SHOW DATABASES;`
- Verify credentials in `.env`

### Port Already in Use
- Change PORT in `.env` to an available port
- Or kill existing process: `lsof -ti:5000 | xargs kill`

### CORS Error
- Ensure CORS_ORIGIN in `.env` matches your frontend URL
- Default is `http://localhost:3000`

### Login Not Working
- Check admin user exists in database
- Verify password is correctly hashed with bcryptjs
- Check backend console for error messages

## Next Steps
1. Create other API endpoints for system management
2. Add system data retrieval endpoints
3. Implement system status update endpoints
4. Add admin panel functionality to manage systems
5. Set up database for storing system information
