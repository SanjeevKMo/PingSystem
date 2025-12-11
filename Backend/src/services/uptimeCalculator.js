/**
 * Uptime Calculator Service
 * Calculates uptime percentage based on downtime records
 * 
 * Location: Backend/src/services/uptimeCalculator.js
 */

const pool = require('../../database/connection');

/**
 * Calculate uptime percentage for a single system
 * Based on downtime records over the last 30 days
 * 
 * @param {number} systemId - System ID
 * @returns {number} Uptime percentage (0-100)
 */
async function calculateSystemUptime(systemId) {
  const connection = await pool.getConnection();
  
  try {
    // Calculate total downtime in the last 30 days
    const [downtimeData] = await connection.execute(
      `SELECT 
        SUM(
          CASE 
            WHEN up_time IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, down_time, up_time)
            ELSE TIMESTAMPDIFF(MINUTE, down_time, NOW())
          END
        ) as total_downtime_minutes
       FROM \`system_downtime\`
       WHERE system_id = ?
       AND down_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [systemId]
    );

    const totalDowntimeMinutes = downtimeData[0].total_downtime_minutes || 0;
    
    // Total minutes in 30 days = 30 * 24 * 60 = 43,200 minutes
    const totalMinutesIn30Days = 43200;
    
    // Calculate uptime percentage
    const uptimePercentage = ((totalMinutesIn30Days - totalDowntimeMinutes) / totalMinutesIn30Days) * 100;
    
    // Clamp between 0 and 100
    const clampedUptime = Math.max(0, Math.min(100, uptimePercentage));
    
    // Round to 2 decimal places
    return Math.round(clampedUptime * 100) / 100;

  } finally {
    connection.release();
  }
}

/**
 * Update uptime percentage in database for a system
 * @param {number} systemId - System ID
 */
async function updateSystemUptime(systemId) {
  const connection = await pool.getConnection();
  
  try {
    const uptimePercentage = await calculateSystemUptime(systemId);
    
    await connection.execute(
      'UPDATE `systems` SET uptime_percentage = ? WHERE id = ?',
      [uptimePercentage, systemId]
    );
    
    console.log(`📊 System ${systemId}: Uptime updated to ${uptimePercentage}%`);
    
    return uptimePercentage;

  } finally {
    connection.release();
  }
}

/**
 * Update uptime percentages for all systems
 * Called after each health check cycle
 */
async function updateAllSystemUptimes() {
  const connection = await pool.getConnection();
  
  try {
    // Get all system IDs
    const [systems] = await connection.execute(
      'SELECT id FROM `systems`'
    );

    console.log(`🔄 Updating uptime for ${systems.length} system(s)...`);

    // Update each system's uptime
    for (const system of systems) {
      await updateSystemUptime(system.id);
    }

    console.log('✅ Uptime percentages updated for all systems');

  } finally {
    connection.release();
  }
}

/**
 * Get system uptime statistics
 * @param {number} systemId - System ID
 * @returns {Object} Uptime statistics
 */
async function getSystemUptimeStats(systemId) {
  const connection = await pool.getConnection();
  
  try {
    // Get downtime records for last 30 days
    const [downtimeRecords] = await connection.execute(
      `SELECT 
        down_time,
        up_time,
        duration_minutes,
        error_message,
        state_transition
       FROM \`system_downtime\`
       WHERE system_id = ?
       AND down_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY down_time DESC`,
      [systemId]
    );

    // Calculate statistics
    const totalIncidents = downtimeRecords.length;
    const totalDowntimeMinutes = downtimeRecords.reduce((sum, record) => {
      return sum + (record.duration_minutes || 0);
    }, 0);

    const currentUptime = await calculateSystemUptime(systemId);

    // Current status (is it currently down?)
    const currentlyDown = downtimeRecords.some(record => record.up_time === null);

    return {
      uptimePercentage: currentUptime,
      totalIncidents,
      totalDowntimeMinutes,
      totalDowntimeHours: Math.round((totalDowntimeMinutes / 60) * 100) / 100,
      currentlyDown,
      recentIncidents: downtimeRecords.slice(0, 5) // Last 5 incidents
    };

  } finally {
    connection.release();
  }
}

/**
 * Get uptime trend over time
 * @param {number} systemId - System ID
 * @param {number} days - Number of days (default 30)
 * @returns {Array} Daily uptime percentages
 */
async function getUptimeTrend(systemId, days = 30) {
  const connection = await pool.getConnection();
  
  try {
    const trend = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Calculate downtime for that specific day
      const [downtimeData] = await connection.execute(
        `SELECT 
          SUM(duration_minutes) as daily_downtime
         FROM \`system_downtime\`
         WHERE system_id = ?
         AND DATE(down_time) = ?`,
        [systemId, dateStr]
      );

      const dailyDowntime = downtimeData[0].daily_downtime || 0;
      const minutesInDay = 1440; // 24 * 60
      const dailyUptime = ((minutesInDay - dailyDowntime) / minutesInDay) * 100;

      trend.push({
        date: dateStr,
        uptime: Math.round(dailyUptime * 100) / 100,
        downtime: dailyDowntime
      });
    }

    return trend;

  } finally {
    connection.release();
  }
}

module.exports = {
  calculateSystemUptime,
  updateSystemUptime,
  updateAllSystemUptimes,
  getSystemUptimeStats,
  getUptimeTrend
};