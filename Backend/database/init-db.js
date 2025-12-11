const mysql = require('mysql2/promise');
require('dotenv').config({path: __dirname + '/../.env'});

/**
 * Database initialization script
 * Creates tables if they don't exist
 * Run: node database/init-db.js
 */

const initializeDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('\n=== Initializing Database ===\n');

    // Create database
    const dbName = process.env.DB_NAME || 'system_monitor';
    // Use query() for DDL statements to avoid prepared-statement protocol errors
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database '${dbName}' ensured`);

    // Switch to database
    await connection.query(`USE ${dbName}`);

    // Create user table
    const userTableQuery = `
      CREATE TABLE IF NOT EXISTS \`user\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(255) NOT NULL UNIQUE,
        \`email\` VARCHAR(255),
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) DEFAULT 'admin',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.query(userTableQuery);
    console.log('✓ User table created');

    // Create systems table (for future use)
    const systemsTableQuery = `
      CREATE TABLE IF NOT EXISTS \`systems\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`type\` VARCHAR(100),
        \`agency\` VARCHAR(100),
        \`url\` VARCHAR(500),
        \`status\` ENUM('Up', 'Down', 'Maintenance') DEFAULT 'Up',
        \`uptime_percentage\` DECIMAL(5, 2) DEFAULT 99.9,
        \`last_check\` TIMESTAMP,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.query(systemsTableQuery);
    console.log('✓ Systems table created');

    // Create audit log table (for future use)
    const auditTableQuery = `
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT,
        \`action\` VARCHAR(255),
        \`description\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.query(auditTableQuery);
    console.log('✓ Audit logs table created');

    console.log('\n✓ Database initialization completed!\n');

  } catch (error) {
    console.error('✗ Database initialization error:', error.message);
  } finally {
    await connection.end();
  }
};

initializeDatabase();
