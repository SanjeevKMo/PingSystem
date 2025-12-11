const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import config and database
const config = require('./config/database');
const pool = require('../database/connection');
const scheduler = require('./services/scheduler');


// Import routes and middleware
const routes = require('./api/routes');
const { errorHandler } = require('./middlewares/auth');

// Initialize Express app
const app = express();
const PORT = config.server.port;

/**
 * Middleware Setup
 */
// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors(config.cors));

/**
 * Routes
 */
app.use('/api', routes);

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Government Systems Monitoring Dashboard - Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/**
 * Error Handler
 */
app.use(errorHandler);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected');
    connection.release();

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════════╗`);
      console.log(`║   Government Systems Monitor - Backend     ║`);
      console.log(`║   Server running on http://localhost:${PORT}   ║`);
      console.log(`║   Environment: ${config.server.env.padEnd(30)}║`);
      console.log(`╚════════════════════════════════════════════╝\n`);

      scheduler.initializeHealthChecks();
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
