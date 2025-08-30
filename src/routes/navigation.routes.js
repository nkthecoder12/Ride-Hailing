const express = require('express');
const router = express.Router();
const { 
    updateDriverLocation,
    getNearbyDrivers,
    calculateRoute,
    estimateFare,
    startRide,
    endRide,
    getRideStatus
} = require('../controllers/navigation.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Driver location management
router.put('/driver/location', authenticateToken, updateDriverLocation);
router.get('/drivers/nearby', getNearbyDrivers);

// Route and fare calculation
router.post('/route/calculate', calculateRoute);
router.post('/fare/estimate', estimateFare);

// Ride management
router.post('/ride/start', authenticateToken, startRide);
router.put('/ride/end', authenticateToken, endRide);
router.get('/ride/:rideId/status', authenticateToken, getRideStatus);

module.exports = router;
