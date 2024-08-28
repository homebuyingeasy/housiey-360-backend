const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a new tour with multiple images
router.post('/tours', authenticateToken, upload.array('images', 30), tourController.createTour);

// Get all tours with their associated images
router.get('/tours', authenticateToken, tourController.getTours);

// Get all tours with their associated image for dashboard
router.get('/tours/dashboard', authenticateToken, tourController.getToursForDashboard);

// Get a specific tour by ID
router.get('/tours/:id', authenticateToken, tourController.getTour);

// Update a tour with optional new images
router.put('/tours/:id', authenticateToken, upload.array('images', 30), tourController.updateTour);

// Delete a tour and associated images
router.delete('/tours/:id', authenticateToken, tourController.deleteTour);

// Delete a single image by ID
router.delete('/tours/images/:id', authenticateToken, tourController.deleteTourImage);

// Delete a single image by ID
router.get('/tours/full/:id', authenticateToken, tourController.getFullRecordFromTourById);



module.exports = router;
