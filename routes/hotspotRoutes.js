const express = require('express');
const router = express.Router();
const hotspotController = require('../controllers/hotspotController');
const authenticateToken = require('../middleware/auth');

// Add a new hotspot
router.post('/hotspots', authenticateToken, hotspotController.addHotspot);

// Get all hotspots by tour_image_id
router.get('/hotspots/tour-image/:tour_image_id', authenticateToken, hotspotController.getHotspotsByTourImageId);

// Get one hotspot by ID
router.get('/hotspots/:id', authenticateToken, hotspotController.getHotspotById);

// Update a hotspot by ID
router.put('/hotspots/:id', authenticateToken, hotspotController.updateHotspot);

// Delete a hotspot by ID
router.delete('/hotspots/:id', authenticateToken, hotspotController.deleteHotspot);


module.exports = router;
