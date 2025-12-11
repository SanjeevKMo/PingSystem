const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../database/connection');
const config = require('../config/database');

/**
 * Admin Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Get database connection
    const connection = await pool.getConnection();

    // Query user from database
    const query = 'SELECT id, username, email, password, role FROM `user` WHERE username = ?';
    const [users] = await connection.execute(query, [username]);

    connection.release();

    // Check if user exists
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
      error: error.message
    });
  }
};

/**
 * Get Current User Info
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const query = 'SELECT id, username, email, role FROM `user` WHERE id = ?';
    const [users] = await connection.execute(query, [req.user.id]);
    
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user info.',
      error: error.message
    });
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful.'
  });
};

module.exports = {
  login,
  getCurrentUser,
  logout
};
