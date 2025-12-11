const express = require('express');
const router = express.Router();
const auth = require('./auth');
const systems = require('./systems');
const agencies = require('./agencies');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/**
 * Auth Routes
 */
router.post('/auth/login', auth.login);
router.post('/auth/logout', verifyToken, auth.logout);
router.get('/auth/me', verifyToken, auth.getCurrentUser);

/**
 * Systems Routes
 * GET endpoints are public (for dashboard display)
 * POST/PUT/DELETE are protected (admin only)
 */
router.get('/systems', systems.getAllSystems);
router.get('/systems/:id', systems.getSystemById);
router.get('/systems/agency/:agency', systems.getSystemsByAgency);
router.post('/systems', verifyToken, systems.createSystem);
router.put('/systems/:id', verifyToken, systems.updateSystem);
router.delete('/systems/:id', verifyToken, systems.deleteSystem);

/**
 * Agencies Routes
 */
router.get('/agencies', agencies.getAllAgencies);
router.get('/agencies/:id', agencies.getAgencyById);
router.get('/agencies/name/:name', agencies.getAgencyByName);
router.post('/agencies', verifyToken, isAdmin, agencies.createAgency);
router.put('/agencies/:id', verifyToken, isAdmin, agencies.updateAgency);
router.delete('/agencies/:id', verifyToken, isAdmin, agencies.deleteAgency);

/**
 * Health Check
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
