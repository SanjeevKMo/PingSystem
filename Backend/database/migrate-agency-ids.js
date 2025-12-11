#!/usr/bin/env node

/**
 * Migration: Update existing systems to have agency_id populated
 * This fixes systems that were created before the agency_id fix
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateSystemAgencyIds() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'system_monitor'
    });

    console.log('📦 Connected to database');
    console.log('🔄 Starting migration: Update systems with agency_id...');

    // First, get all systems without agency_id
    const [systemsWithoutId] = await connection.execute(
      'SELECT id, agency FROM `systems` WHERE agency_id IS NULL OR agency_id = 0'
    );

    console.log(`\n📋 Found ${systemsWithoutId.length} systems without agency_id`);

    let updated = 0;
    let failed = 0;

    for (const system of systemsWithoutId) {
      try {
        // Look up the agency ID by name
        const [agencies] = await connection.execute(
          'SELECT id FROM `agencies` WHERE name = ? LIMIT 1',
          [system.agency]
        );

        if (agencies.length > 0) {
          const agencyId = agencies[0].id;
          
          // Update the system with the agency_id
          await connection.execute(
            'UPDATE `systems` SET agency_id = ? WHERE id = ?',
            [agencyId, system.id]
          );
          
          console.log(`   ✅ System ${system.id} (${system.agency}): Updated agency_id = ${agencyId}`);
          updated++;
        } else {
          console.log(`   ⚠️  System ${system.id}: Agency "${system.agency}" not found`);
          failed++;
        }
      } catch (err) {
        console.error(`   ❌ System ${system.id}: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Migration complete:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);

    // Verify results
    const [remaining] = await connection.execute(
      'SELECT COUNT(*) as count FROM `systems` WHERE agency_id IS NULL OR agency_id = 0'
    );

    console.log(`\n🔍 Verification: ${remaining[0].count} systems still have no agency_id`);

    await connection.end();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateSystemAgencyIds();
