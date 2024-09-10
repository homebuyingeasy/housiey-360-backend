const express = require('express');
const router = express.Router();
const hotspotImageController = require('../controllers/hotspotImageController');
const authenticateToken = require('../middleware/auth');


// Get all hotspots by tour_image_id
router.get('/hotspot/images', authenticateToken, hotspotImageController.getHotspotImages);

module.exports = router;
