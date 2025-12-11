/**
 * Systems Management API
 * CRUD operations for managing systems in the monitoring dashboard
 */

const connection = require('../../database/connection');

/**
 * Get all systems
 */
const getAllSystems = async (req, res) => {
  try {
    const [systems] = await connection.execute(
      'SELECT id, name, type, agency, url, status, uptime_percentage, last_check, created_at FROM `systems` ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: systems,
      count: systems.length
    });
  } catch (error) {
    console.error('Error fetching systems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch systems',
      error: error.message
    });
  }
};

/**
 * Get system by ID
 */
const getSystemById = async (req, res) => {
  try {
    const { id } = req.params;
    const [systems] = await connection.execute(
      'SELECT id, name, type, agency, url, status, uptime_percentage, last_check, created_at FROM `systems` WHERE id = ?',
      [id]
    );
    
    if (systems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'System not found'
      });
    }

    res.json({
      success: true,
      data: systems[0]
    });
  } catch (error) {
    console.error('Error fetching system:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system',
      error: error.message
    });
  }
};

/**
 * Create new system
 */
const createSystem = async (req, res) => {
  try {
    const { name, type, agency, url, status = 'Up' } = req.body;

    // Validate required fields
    if (!name || !type || !agency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, type, agency'
      });
    }

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }
    }

    // Look up agency ID from agency name
    const [agencies] = await connection.execute(
      'SELECT id FROM `agencies` WHERE name = ?',
      [agency]
    );

    let agencyId = null;
    if (agencies.length > 0) {
      agencyId = agencies[0].id;
    } else {
      return res.status(404).json({
        success: false,
        message: `Agency "${agency}" not found in database`
      });
    }

    const [result] = await connection.execute(
      'INSERT INTO `systems` (name, type, agency, agency_id, url, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, agency, agencyId, url || null, status]
    );

    res.status(201).json({
      success: true,
      message: 'System created successfully',
      data: {
        id: result.insertId,
        name,
        type,
        agency,
        agency_id: agencyId,
        url: url || null,
        status
      }
    });
  } catch (error) {
    console.error('Error creating system:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create system',
      error: error.message
    });
  }
};

/**
 * Update system
 */
const updateSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, agency, url, status } = req.body;

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }
    }

    // Check if system exists
    const [existing] = await connection.execute(
      'SELECT id FROM `systems` WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'System not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (agency !== undefined) {
      // Look up agency ID from agency name
      const [agencies] = await connection.execute(
        'SELECT id FROM `agencies` WHERE name = ?',
        [agency]
      );
      
      if (agencies.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Agency "${agency}" not found in database`
        });
      }
      
      updates.push('agency = ?', 'agency_id = ?');
      values.push(agency, agencies[0].id);
    }
    if (url !== undefined) {
      updates.push('url = ?');
      values.push(url);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await connection.execute(
      `UPDATE \`systems\` SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'System updated successfully'
    });
  } catch (error) {
    console.error('Error updating system:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system',
      error: error.message
    });
  }
};

/**
 * Delete system
 */
const deleteSystem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if system exists
    const [existing] = await connection.execute(
      'SELECT id FROM `systems` WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'System not found'
      });
    }

    await connection.execute(
      'DELETE FROM `systems` WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'System deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting system:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete system',
      error: error.message
    });
  }
};

/**
 * Get systems by agency
 */
const getSystemsByAgency = async (req, res) => {
  try {
    const { agency } = req.params;

    const [systems] = await connection.execute(
      'SELECT id, name, type, agency, url, status, uptime_percentage, last_check FROM `systems` WHERE agency = ? ORDER BY name',
      [agency]
    );

    res.json({
      success: true,
      data: systems,
      count: systems.length
    });
  } catch (error) {
    console.error('Error fetching systems by agency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch systems',
      error: error.message
    });
  }
};

module.exports = {
  getAllSystems,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem,
  getSystemsByAgency
};
