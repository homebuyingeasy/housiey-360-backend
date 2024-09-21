const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// Handle both projectLogo and tourImages
const uploadFields = upload.fields([
    { name: 'projectLogo', maxCount: 1 },
    { name: 'images', maxCount: 30 },
  ]);

  
// Create a new tour with multiple images
router.post('/tours', authenticateToken, uploadFields, tourController.createTour);

// Get all tours with their associated images
router.get('/tours', authenticateToken, tourController.getTours);

// Get all tours with their associated image for dashboard
router.get('/tours/dashboard', authenticateToken, tourController.getToursForDashboard);

// Get a specific tour by ID
router.get('/tours/:id', authenticateToken, tourController.getTour);

// Update a tour with optional new images
router.put('/tours/:id', authenticateToken, uploadFields, tourController.updateTour);

// Delete a tour and associated images
router.delete('/tours/:id', authenticateToken, tourController.deleteTour);

// Delete a single image by ID
router.delete('/tours/images/:id', authenticateToken, tourController.deleteTourImage);

router.get('/tours/full/:id', authenticateToken, tourController.getFullRecordFromTourById);

router.get('/tours/record/backend/:id', authenticateToken, tourController.getFullRecordFromTourByIdForBackend);



module.exports = router;
