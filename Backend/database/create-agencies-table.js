/**
 * Migration Script: Create Agencies Table
 * 
 * This script:
 * 1. Creates the `agencies` table with icon/image support
 * 2. Inserts existing agencies from the database
 * 3. Adds agency_id foreign key to systems table (optional, for future use)
 * 
 * Run: node database/create-agencies-table.js
 */

const connection = require('./connection');

const createAgenciesTable = async () => {
  try {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     Creating Agencies Table Migration      ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // Step 1: Create agencies table
    console.log('📋 Step 1: Creating agencies table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS \`agencies\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL UNIQUE,
        \`description\` TEXT,
        \`icon_emoji\` VARCHAR(10),
        \`icon_url\` VARCHAR(500),
        \`color_code\` VARCHAR(7),
        \`contact_email\` VARCHAR(255),
        \`contact_phone\` VARCHAR(20),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);
    console.log('✓ Agencies table created successfully\n');

    // Step 2: Insert existing agencies with icons
    console.log('📋 Step 2: Inserting existing agencies...');
    const agenciesToInsert = [
      {
        name: 'Ministry of Health',
        description: 'Government health services and medical systems',
        icon_emoji: '🏥',
        color_code: '#28a745',
        contact_email: 'info@health.gov',
        contact_phone: '+1-555-0101'
      },
      {
        name: 'MoESD',
        description: 'Ministry of Education and Skills Development',
        icon_emoji: '📚',
        color_code: '#007bff',
        contact_email: 'contact@moesd.gov',
        contact_phone: '+1-555-0102'
      },
      {
        name: 'The PEMA Secretariat',
        description: 'Disaster management and emergency response',
        icon_emoji: '🚨',
        color_code: '#dc3545',
        contact_email: 'emergency@pema.gov',
        contact_phone: '+1-555-0103'
      }
    ];

    for (const agency of agenciesToInsert) {
      try {
        const insertQuery = `
          INSERT INTO \`agencies\` (name, description, icon_emoji, color_code, contact_email, contact_phone)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        `;

        await connection.execute(insertQuery, [
          agency.name,
          agency.description,
          agency.icon_emoji,
          agency.color_code,
          agency.contact_email,
          agency.contact_phone
        ]);

        console.log(`  ✓ Inserted: ${agency.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`  ⚠ Already exists: ${agency.name} (skipped)`);
        } else {
          throw error;
        }
      }
    }
    console.log('');

    // Step 3: Check if systems table exists and has agency_id column
    console.log('📋 Step 3: Checking systems table structure...');
    const checkSystemsQuery = `
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'systems' AND COLUMN_NAME = 'agency_id'
    `;

    const [columns] = await connection.execute(checkSystemsQuery);

    if (columns.length === 0) {
      console.log('  Adding agency_id column to systems table...');
      
      // Add agency_id column
      const addColumnQuery = `
        ALTER TABLE \`systems\`
        ADD COLUMN \`agency_id\` INT,
        ADD FOREIGN KEY (\`agency_id\`) REFERENCES \`agencies\`(\`id\`) ON DELETE SET NULL
      `;

      await connection.execute(addColumnQuery);
      console.log('  ✓ agency_id column added with foreign key constraint\n');
    } else {
      console.log('  ⚠ agency_id column already exists\n');
    }

    // Step 4: Populate agency_id based on agency name (for existing data)
    console.log('📋 Step 4: Linking existing systems to agencies...');
    const updateSystemsQuery = `
      UPDATE \`systems\` s
      JOIN \`agencies\` a ON s.agency = a.name COLLATE utf8mb4_unicode_ci
      SET s.agency_id = a.id
      WHERE s.agency_id IS NULL
    `;

    const [result] = await connection.execute(updateSystemsQuery);
    console.log(`  ✓ Updated ${result.affectedRows} system records\n`);

    // Step 5: Verify
    console.log('📋 Step 5: Verification...');
    const [agenciesCount] = await connection.execute('SELECT COUNT(*) as count FROM `agencies`');
    const [systemsWithAgencyId] = await connection.execute(
      'SELECT COUNT(*) as count FROM `systems` WHERE agency_id IS NOT NULL'
    );

    console.log(`  ✓ Total agencies: ${agenciesCount[0].count}`);
    console.log(`  ✓ Systems linked to agencies: ${systemsWithAgencyId[0].count}\n`);

    // Step 6: Display agencies
    console.log('📋 Agencies in Database:');
    const [agencies] = await connection.execute(
      'SELECT id, name, icon_emoji, color_code FROM `agencies` ORDER BY id'
    );

    agencies.forEach(agency => {
      console.log(`  ${agency.icon_emoji} [ID: ${agency.id}] ${agency.name} (${agency.color_code})`);
    });

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║        Migration Completed Successfully    ║');
    console.log('╚════════════════════════════════════════════╝\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run migration
createAgenciesTable();
