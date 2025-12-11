/**
 * Database Migration: Create system_downtime table
 * Tracks system outages and uptime history
 * 
 * Location: Backend/database/create-downtime-table.js
 * 
 * Usage: node database/create-downtime-table.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({path: __dirname + '/../.env'});

const createDowntimeTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'system_monitor'
  });

  try {
    console.log('\n=== Creating system_downtime Table ===\n');

    // Create system_downtime table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS \`system_downtime\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`system_id\` INT NOT NULL,
        \`down_time\` TIMESTAMP NOT NULL,
        \`up_time\` TIMESTAMP NULL,
        \`duration_minutes\` INT DEFAULT NULL,
        \`state_transition\` VARCHAR(50) DEFAULT NULL,
        \`error_message\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_system_id\` (\`system_id\`),
        INDEX \`idx_down_time\` (\`down_time\`),
        INDEX \`idx_up_time\` (\`up_time\`),
        FOREIGN KEY (\`system_id\`) REFERENCES \`systems\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTableQuery);
    console.log('✓ Table `system_downtime` created successfully');

    // Check if table exists and show structure
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'system_downtime'"
    );

    if (tables.length > 0) {
      console.log('\n✓ Verifying table structure...\n');
      const [columns] = await connection.query(
        "DESCRIBE `system_downtime`"
      );
      
      console.log('Table Columns:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
      });
    }

    // Create trigger to auto-calculate duration when up_time is set
    console.log('\n✓ Creating auto-duration trigger...');
    
    const createTriggerQuery = `
      CREATE TRIGGER IF NOT EXISTS \`update_downtime_duration\`
      BEFORE UPDATE ON \`system_downtime\`
      FOR EACH ROW
      BEGIN
        IF NEW.up_time IS NOT NULL AND OLD.up_time IS NULL THEN
          SET NEW.duration_minutes = TIMESTAMPDIFF(MINUTE, NEW.down_time, NEW.up_time);
        END IF;
      END;
    `;

    try {
      await connection.query(createTriggerQuery);
      console.log('✓ Trigger `update_downtime_duration` created');
    } catch (error) {
      if (error.code === 'ER_TRG_ALREADY_EXISTS') {
        console.log('ℹ️  Trigger already exists, skipping');
      } else {
        console.warn('⚠️  Could not create trigger:', error.message);
      }
    }

    console.log('\n✅ Database migration completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. The system_downtime table is ready');
    console.log('  2. Run: npm install node-cron axios');
    console.log('  3. Update Backend/src/index.js to initialize scheduler');
    console.log('  4. Restart your backend server\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nCommon issues:');
    console.error('  - MySQL server not running');
    console.error('  - Database "system_monitor" does not exist');
    console.error('  - systems table does not exist (run init-db.js first)');
    console.error('  - Insufficient privileges\n');
    process.exit(1);
  } finally {
    await connection.end();
  }
};

// Run migration
createDowntimeTable();