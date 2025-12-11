/**
 * Health Check Scheduler
 * Uses node-cron to run automated health checks
 * 
 * Location: Backend/src/services/scheduler.js
 */

const cron = require('node-cron');
const healthCheck = require('./healthCheck');

// Store active cron jobs
let activeJobs = [];

/**
 * Initialize health check scheduler
 * Runs health checks every 5 minutes by default
 * 
 * Cron expression format:
 * ┌────────────── second (optional, 0-59)
 * │ ┌──────────── minute (0-59)
 * │ │ ┌────────── hour (0-23)
 * │ │ │ ┌──────── day of month (1-31)
 * │ │ │ │ ┌────── month (1-12)
 * │ │ │ │ │ ┌──── day of week (0-6, Sunday=0)
 * │ │ │ │ │ │
 * * * * * * *
 */
function initializeHealthChecks(interval = '*/5 * * * *') {
  console.log('🚀 Initializing health check scheduler...');
  console.log(`⏰ Schedule: Check every 5 minutes (cron: ${interval})`);

  // Stop any existing jobs
  stopAllSchedulers();

  // Schedule health checks
  const healthCheckJob = cron.schedule(interval, async () => {
    const timestamp = new Date().toISOString();
    console.log(`\n⏰ [${timestamp}] Health check cycle triggered`);
    
    try {
      const summary = await healthCheck.checkAllSystems();
      
      // Log summary
      console.log(`📋 Summary: ${summary.checked}/${summary.total} checked, ${summary.up} up, ${summary.down} down`);
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Thimphu" // Adjust to your timezone
  });

  activeJobs.push({
    name: 'health-check',
    job: healthCheckJob,
    schedule: interval
  });

  console.log('✅ Health check scheduler started successfully');
  console.log('ℹ️  First check will run at next scheduled interval\n');

  // Run initial health check immediately (optional)
  console.log('🔍 Running initial health check...');
  healthCheck.checkAllSystems()
    .then(summary => {
      console.log(`✅ Initial check complete: ${summary.up} up, ${summary.down} down\n`);
    })
    .catch(error => {
      console.error('❌ Initial health check failed:', error.message);
    });

  return healthCheckJob;
}

/**
 * Initialize with custom interval
 * @param {number} minutes - Check interval in minutes
 */
function initializeWithInterval(minutes) {
  const cronExpression = `*/${minutes} * * * *`;
  console.log(`⏰ Setting custom interval: Every ${minutes} minute(s)`);
  return initializeHealthChecks(cronExpression);
}

/**
 * Stop all active schedulers
 */
function stopAllSchedulers() {
  if (activeJobs.length === 0) {
    console.log('ℹ️  No active schedulers to stop');
    return;
  }

  console.log(`🛑 Stopping ${activeJobs.length} active scheduler(s)...`);
  
  activeJobs.forEach(jobInfo => {
    jobInfo.job.stop();
    console.log(`   ✓ Stopped: ${jobInfo.name}`);
  });

  activeJobs = [];
  console.log('✅ All schedulers stopped');
}

/**
 * Get status of active schedulers
 * @returns {Array} Active job information
 */
function getSchedulerStatus() {
  return activeJobs.map(jobInfo => ({
    name: jobInfo.name,
    schedule: jobInfo.schedule,
    running: true
  }));
}

/**
 * Run health check manually (outside of schedule)
 */
async function runManualCheck() {
  console.log('🔍 Manual health check triggered...');
  try {
    const summary = await healthCheck.checkAllSystems();
    console.log('✅ Manual check complete');
    return summary;
  } catch (error) {
    console.error('❌ Manual check failed:', error.message);
    throw error;
  }
}

/**
 * Predefined schedule presets
 */
const schedulePresets = {
  EVERY_1_MIN: '*/1 * * * *',    // Every minute
  EVERY_2_MIN: '*/2 * * * *',    // Every 2 minutes
  EVERY_5_MIN: '*/5 * * * *',    // Every 5 minutes (default)
  EVERY_10_MIN: '*/10 * * * *',  // Every 10 minutes
  EVERY_15_MIN: '*/15 * * * *',  // Every 15 minutes
  EVERY_30_MIN: '*/30 * * * *',  // Every 30 minutes
  EVERY_HOUR: '0 * * * *',       // Every hour at minute 0
};

/**
 * Initialize with a preset schedule
 * @param {string} preset - One of the schedulePresets keys
 */
function initializeWithPreset(preset) {
  const cronExpression = schedulePresets[preset];
  
  if (!cronExpression) {
    throw new Error(`Invalid preset: ${preset}. Available presets: ${Object.keys(schedulePresets).join(', ')}`);
  }

  console.log(`⏰ Using preset: ${preset} (${cronExpression})`);
  return initializeHealthChecks(cronExpression);
}

module.exports = {
  initializeHealthChecks,
  initializeWithInterval,
  initializeWithPreset,
  stopAllSchedulers,
  getSchedulerStatus,
  runManualCheck,
  schedulePresets
};