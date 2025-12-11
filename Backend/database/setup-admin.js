const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({path: __dirname + '/../.env'});

/**
 * Utility script to hash password and insert/update admin user
 * Run: node database/setup-admin.js
 */

const createAdminUser = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'system_monitor'
  });

  try {
    // Password to hash
    const password = 'password123'; // Default password - change this!
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('\n=== Admin User Setup ===\n');
    console.log('Username: admin');
    console.log('Password:', password);
    console.log('Hashed Password:', hashedPassword);
    console.log('\n');

    // Check if admin user exists
    const [users] = await connection.execute(
      'SELECT id FROM `user` WHERE username = ?',
      ['admin']
    );

    if (users.length > 0) {
      // Update existing admin
      await connection.execute(
        'UPDATE `user` SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );
      console.log('✓ Admin user updated successfully!');
    } else {
      // Insert new admin
      await connection.execute(
        'INSERT INTO `user` (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@system-monitor.gov', hashedPassword, 'admin']
      );
      console.log('✓ Admin user created successfully!');
    }

    console.log('\nYou can now login with:');
    console.log('- Username: admin');
    console.log('- Password: password123\n');

  } catch (error) {
    console.error('✗ Error setting up admin user:', error.message);
  } finally {
    await connection.end();
  }
};

createAdminUser();
