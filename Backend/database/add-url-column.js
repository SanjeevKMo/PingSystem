/**
 * Add URL column to systems table if it doesn't exist
 */

const mysql = require('mysql2/promise');
require('dotenv').config({path: __dirname +'/../.env'});

const addUrlColumn = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'system_monitor'
  });

  try {
    console.log('\n=== Adding URL Column to Systems Table ===\n');

    // Add URL column if it doesn't exist
    await connection.query(`
      ALTER TABLE \`systems\` ADD COLUMN \`url\` VARCHAR(500) AFTER \`agency\`
    `);

    console.log('✓ URL column added successfully');
    console.log('\n✓ Database schema update completed!\n');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ URL column already exists');
    } else {
      console.error('✗ Error adding URL column:', error.message);
    }
  } finally {
    await connection.end();
  }
};

addUrlColumn();
