/**
 * Agencies Management API
 * CRUD operations for managing agencies in the monitoring dashboard
 */

const connection = require('../../database/connection');

/**
 * Get all agencies with system count
 * GET /api/agencies
 */
const getAllAgencies = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.name,
        a.description,
        a.icon_emoji,
        a.icon_url,
        a.color_code,
        a.contact_email,
        a.contact_phone,
        COUNT(s.id) as systems_count,
        SUM(CASE WHEN s.status = 'Up' THEN 1 ELSE 0 END) as systems_up,
        SUM(CASE WHEN s.status = 'Down' THEN 1 ELSE 0 END) as systems_down,
        a.created_at,
        a.updated_at
      FROM \`agencies\` a
      LEFT JOIN \`systems\` s ON a.id = s.agency_id
      GROUP BY a.id
      ORDER BY a.name ASC
    `;

    const [agencies] = await connection.execute(query);

    res.json({
      success: true,
      data: agencies,
      count: agencies.length
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agencies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get agency by ID with all systems
 * GET /api/agencies/:id
 */
const getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agency ID'
      });
    }

    // Get agency details
    const agencyQuery = `
      SELECT 
        a.id,
        a.name,
        a.description,
        a.icon_emoji,
        a.icon_url,
        a.color_code,
        a.contact_email,
        a.contact_phone,
        a.created_at,
        a.updated_at
      FROM \`agencies\` a
      WHERE a.id = ?
    `;

    const [agencies] = await connection.execute(agencyQuery, [id]);

    if (agencies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    const agency = agencies[0];

    // Get systems for this agency
    const systemsQuery = `
      SELECT 
        id,
        name,
        type,
        agency,
        agency_id,
        url,
        status,
        uptime_percentage,
        last_check,
        created_at
      FROM \`systems\`
      WHERE agency_id = ?
      ORDER BY name ASC
    `;

    const [systems] = await connection.execute(systemsQuery, [id]);

    res.json({
      success: true,
      data: {
        ...agency,
        systems_count: systems.length,
        systems_up: systems.filter(s => s.status === 'Up').length,
        systems_down: systems.filter(s => s.status === 'Down').length,
        systems
      }
    });
  } catch (error) {
    console.error('Error fetching agency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get agency by name
 * GET /api/agencies/name/:name
 */
const getAgencyByName = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Agency name is required'
      });
    }

    const query = `
      SELECT 
        id,
        name,
        description,
        icon_emoji,
        icon_url,
        color_code,
        contact_email,
        contact_phone,
        created_at,
        updated_at
      FROM \`agencies\`
      WHERE name = ?
    `;

    const [agencies] = await connection.execute(query, [name]);

    if (agencies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    const agency = agencies[0];

    // Get systems for this agency
    const systemsQuery = `
      SELECT 
        id,
        name,
        type,
        agency,
        status,
        uptime_percentage,
        last_check
      FROM \`systems\`
      WHERE agency_id = ?
      ORDER BY name ASC
    `;

    const [systems] = await connection.execute(systemsQuery, [agency.id]);

    res.json({
      success: true,
      data: {
        ...agency,
        systems_count: systems.length,
        systems_up: systems.filter(s => s.status === 'Up').length,
        systems_down: systems.filter(s => s.status === 'Down').length,
        systems
      }
    });
  } catch (error) {
    console.error('Error fetching agency by name:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new agency (Admin only)
 * POST /api/agencies
 */
const createAgency = async (req, res) => {
  try {
    const { name, description, icon_emoji, icon_url, color_code, contact_email, contact_phone } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Agency name is required'
      });
    }

    // Validate color code format if provided (optional field)
    if (color_code && (!/^#[0-9A-F]{6}$/i.test(color_code.trim()))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid color code format. Use #RRGGBB (e.g., #FF5733)'
      });
    }

    // Validate email if provided
    if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const query = `
      INSERT INTO \`agencies\` (name, description, icon_emoji, icon_url, color_code, contact_email, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(query, [
      name.trim(),
      description || null,
      icon_emoji || null,
      icon_url || null,
      color_code || '#667eea',
      contact_email || null,
      contact_phone || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: {
        id: result.insertId,
        name,
        description,
        icon_emoji,
        icon_url,
        color_code: color_code || '#667eea',
        contact_email,
        contact_phone
      }
    });
  } catch (error) {
    console.error('Error creating agency:', error);
    
    // Handle duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Agency with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create agency',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update agency (Admin only)
 * PUT /api/agencies/:id
 */
const updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon_emoji, icon_url, color_code, contact_email, contact_phone } = req.body;

    // Validate ID
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agency ID'
      });
    }

    // Check if agency exists
    const [existing] = await connection.execute('SELECT id FROM `agencies` WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Validate color code if provided (optional field)
    if (color_code && (!/^#[0-9A-F]{6}$/i.test(color_code.trim()))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid color code format. Use #RRGGBB (e.g., #FF5733)'
      });
    }

    // Validate email if provided
    if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description || null);
    }
    if (icon_emoji !== undefined) {
      updates.push('icon_emoji = ?');
      values.push(icon_emoji || null);
    }
    if (icon_url !== undefined) {
      updates.push('icon_url = ?');
      values.push(icon_url || null);
    }
    if (color_code !== undefined) {
      updates.push('color_code = ?');
      values.push(color_code);
    }
    if (contact_email !== undefined) {
      updates.push('contact_email = ?');
      values.push(contact_email || null);
    }
    if (contact_phone !== undefined) {
      updates.push('contact_phone = ?');
      values.push(contact_phone || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    const query = `UPDATE \`agencies\` SET ${updates.join(', ')} WHERE id = ?`;
    await connection.execute(query, values);

    res.json({
      success: true,
      message: 'Agency updated successfully'
    });
  } catch (error) {
    console.error('Error updating agency:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Agency with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update agency',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete agency (Admin only)
 * DELETE /api/agencies/:id
 */
const deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agency ID'
      });
    }

    // Check if agency exists
    const [existing] = await connection.execute('SELECT id FROM `agencies` WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Check if agency has systems
    const [systems] = await connection.execute(
      'SELECT COUNT(*) as count FROM `systems` WHERE agency_id = ?',
      [id]
    );

    if (systems[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete agency with ${systems[0].count} system(s). Please reassign systems first.`
      });
    }

    // Delete the agency
    await connection.execute('DELETE FROM `agencies` WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Agency deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting agency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agency',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllAgencies,
  getAgencyById,
  getAgencyByName,
  createAgency,
  updateAgency,
  deleteAgency
};
