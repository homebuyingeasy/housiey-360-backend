const db = require('../models');

// Create a new tour with images
exports.createTour = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const tour = await db.Tour.create({ name, description });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => ({
        name: file.filename,
        url: `/uploads/${file.filename}`,
        tourId: tour.id,
      }));

      await db.TourImage.bulkCreate(images);
    }

    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single tour with images by ID
exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await db.Tour.findByPk(id, {
      include: [{ model: db.TourImage, as: 'tourImages' }],
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found.' });
    }

    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTours = async (req, res) => {
  try {
    const tours = await db.Tour.findAll({
      include: [{ model: db.TourImage, as: 'tourImages' }],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const tour = await db.Tour.findByPk(id,
      { attributes: { exclude: ['createdAt', 'updatedAt'] } });
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found.' });
    }

    // Update tour details
    await tour.update({ name, description });

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      // Delete old images
      await db.TourImage.destroy({ where: { tourId: id } });

      // Add new images
      const images = req.files.map(file => ({
        name: file.filename,
        url: `/uploads/${file.filename}`,
        tourId: tour.id,
      }));

      await db.TourImage.bulkCreate(images);
    }

    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await db.Tour.findByPk(id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found.' });
    }

    // Delete associated images
    await db.TourImage.destroy({ where: { tourId: id } });

    // Delete the tour
    await tour.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTourImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the image by ID
    const tourImage = await db.TourImage.findByPk(id);

    if (!tourImage) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Delete the image
    await tourImage.destroy();

    res.status(200).json({ message: 'Image deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
