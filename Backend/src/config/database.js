require('dotenv').config();

module.exports = {
  // Database Configuration
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'system_monitor'
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // CORS Configuration
  cors: {
    origin: function(origin, callback) {
      // Allow requests from localhost on any port (for dev), plus any configured origin
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
      
      // Allow requests without an origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true
  }
};
