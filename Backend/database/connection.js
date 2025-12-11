const mysql = require('mysql2/promise');
require('dotenv').config({path: __dirname + '/../.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'system_monitor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connected Successfully');
    connection.release();
  } catch (err) {
    console.error('✗ Database Connection Error:', err.message);
    process.exit(1);
  }
})();


module.exports = pool;
