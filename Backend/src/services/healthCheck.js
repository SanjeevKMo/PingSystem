/**
 * Enhanced Health Check Service with Debug Mode
 * Location: Backend/src/services/healthCheck.js
 */

const axios = require('axios');
const https = require('https');
const pool = require('../../database/connection');
const uptimeCalculator = require('./uptimeCalculator');

/**
 * Check health of a single system
 * @param {Object} system - System object with id, name, url, status
 * @returns {Object} Result with newStatus, responseTime, error
 */
async function checkSystemHealth(system) {
  const startTime = Date.now();
  
  try {
    // Skip systems without URLs
    if (!system.url) {
      console.log(`⚠️  Skipping ${system.name}: No URL configured`);
      return {
        systemId: system.id,
        systemName: system.name,
        newStatus: system.status,
        responseTime: null,
        error: 'No URL configured',
        checked: false
      };
    }

    console.log(`🔍 Checking ${system.name} at ${system.url}...`);

    // Make HTTP request with enhanced configuration
    const response = await axios.get(system.url, {
      timeout: 30000, // 30 second timeout for government sites
      maxRedirects: 5, // Follow up to 5 redirects
      validateStatus: (status) => status < 600,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      },
      // Allow self-signed certificates for government domains
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Accept self-signed certificates
        keepAlive: true
      })
    });

    const responseTime = Date.now() - startTime;
    const newStatus = response.status >= 200 && response.status < 400 ? 'Up' : 'Down';

    console.log(`✅ ${system.name}: HTTP ${response.status} (${responseTime}ms) → ${newStatus}`);

    return {
      systemId: system.id,
      systemName: system.name,
      newStatus,
      responseTime,
      httpStatus: response.status,
      error: null,
      checked: true
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorMessage = 'Unknown error';
    let debugInfo = '';

    // Detailed error categorization
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
      debugInfo = 'Server actively refused the connection';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout';
      debugInfo = `Request exceeded ${Math.round(responseTime/1000)}s timeout`;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS resolution failed';
      debugInfo = 'Domain name could not be resolved';
    } else if (error.code === 'ECONNRESET') {
      errorMessage = 'Connection reset';
      debugInfo = 'Connection was forcibly closed by the server';
    } else if (error.code === 'CERT_HAS_EXPIRED') {
      errorMessage = 'SSL certificate expired';
      debugInfo = 'The SSL/TLS certificate has expired';
    } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      errorMessage = 'SSL certificate verification failed';
      debugInfo = 'Unable to verify SSL certificate chain';
    } else if (error.response) {
      errorMessage = `HTTP ${error.response.status}`;
      debugInfo = `Server returned ${error.response.status} ${error.response.statusText}`;
    } else {
      errorMessage = error.message;
      debugInfo = error.stack ? error.stack.split('\n')[0] : error.message;
    }

    console.log(`❌ ${system.name}: ${errorMessage} (${responseTime}ms) → Down`);
    console.log(`   Debug: ${debugInfo}`);
    if (error.code) console.log(`   Error Code: ${error.code}`);

    return {
      systemId: system.id,
      systemName: system.name,
      newStatus: 'Down',
      responseTime,
      httpStatus: error.response?.status || null,
      error: errorMessage,
      debugInfo: debugInfo,
      errorCode: error.code,
      checked: true
    };
  }
}

/**
 * Test a specific URL manually (for debugging)
 * @param {string} url - URL to test
 */
async function testUrl(url) {
  console.log(`\n🧪 Testing URL: ${url}`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: () => true, // Accept any status
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Response received:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response Time: ${responseTime}ms`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length'] || 'unknown'}`);
    console.log(`   Server: ${response.headers['server'] || 'unknown'}`);
    
    if (response.request?.res?.responseUrl) {
      console.log(`   Final URL: ${response.request.res.responseUrl}`);
    }
    
    return {
      success: true,
      status: response.status,
      responseTime,
      headers: response.headers
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.log(`❌ Request failed:`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    console.log(`   Response Time: ${responseTime}ms`);
    
    if (error.response) {
      console.log(`   HTTP Status: ${error.response.status}`);
      console.log(`   Headers:`, error.response.headers);
    }
    
    console.log(`\n📋 Full error:`, error.stack);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      responseTime
    };
  }
}

/**
 * Update system status in database
 */
async function updateSystemStatus(systemId, newStatus, errorMessage = null) {
  const connection = await pool.getConnection();
  
  try {
    const [systems] = await connection.execute(
      'SELECT status FROM `systems` WHERE id = ?',
      [systemId]
    );

    if (systems.length === 0) {
      console.warn(`System ${systemId} not found in database`);
      return;
    }

    const oldStatus = systems[0].status;

    await connection.execute(
      'UPDATE `systems` SET status = ?, last_check = NOW() WHERE id = ?',
      [newStatus, systemId]
    );

    if (oldStatus !== newStatus) {
      await logStatusTransition(connection, systemId, oldStatus, newStatus, errorMessage);
    }

  } finally {
    connection.release();
  }
}

/**
 * Log status transition
 */
async function logStatusTransition(connection, systemId, oldStatus, newStatus, errorMessage) {
  const transition = `${oldStatus} → ${newStatus}`;
  
  if (newStatus === 'Down') {
    await connection.execute(
      `INSERT INTO \`system_downtime\` 
       (system_id, down_time, state_transition, error_message) 
       VALUES (?, NOW(), ?, ?)`,
      [systemId, transition, errorMessage]
    );
    console.log(`📉 System ${systemId} went DOWN: ${errorMessage}`);
    
  } else if (newStatus === 'Up' && oldStatus === 'Down') {
    await connection.execute(
      `UPDATE \`system_downtime\` 
       SET up_time = NOW(), 
           duration_minutes = TIMESTAMPDIFF(MINUTE, down_time, NOW())
       WHERE system_id = ? AND up_time IS NULL
       ORDER BY down_time DESC LIMIT 1`,
      [systemId]
    );
    console.log(`📈 System ${systemId} came back UP`);
  }
}

/**
 * Check all systems
 */
async function checkAllSystems() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n🔍 Starting health check cycle...');
    
    const [systems] = await connection.execute(
      'SELECT id, name, url, status FROM `systems` WHERE url IS NOT NULL AND url != ""'
    );

    if (systems.length === 0) {
      console.log('ℹ️  No systems with URLs to check');
      return {
        total: 0,
        checked: 0,
        up: 0,
        down: 0,
        skipped: 0
      };
    }

    console.log(`📊 Checking ${systems.length} system(s)...`);

    const results = await Promise.all(
      systems.map(system => checkSystemHealth(system))
    );

    for (const result of results) {
      if (result.checked) {
        await updateSystemStatus(result.systemId, result.newStatus, result.error);
      }
    }

    await uptimeCalculator.updateAllSystemUptimes();

    const checked = results.filter(r => r.checked);
    const summary = {
      total: systems.length,
      checked: checked.length,
      up: checked.filter(r => r.newStatus === 'Up').length,
      down: checked.filter(r => r.newStatus === 'Down').length,
      skipped: systems.length - checked.length
    };

    console.log(`✅ Health check complete: ${summary.up} Up, ${summary.down} Down, ${summary.skipped} Skipped\n`);

    return summary;

  } finally {
    connection.release();
  }
}

module.exports = {
  checkSystemHealth,
  checkAllSystems,
  updateSystemStatus,
  testUrl // Export for manual testing
};