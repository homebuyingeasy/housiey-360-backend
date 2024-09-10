const db = require('../models');

// Create a new tour with images
exports.createTour = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const tour = await db.Tour.create({ name, description });

    // Process and save each uploaded image
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file, index) => {
        return {
          tourId: tour.id,
          name: req.body[`imagesData[${index}]name`],
          url: `/uploads/${file.filename}`,
          order: Number(req.body[`imagesData[${index}]order`]),
        };
      });
      // Save all imagesData in the database
      await db.TourImage.bulkCreate(imageRecords);
    }

    res.status(201).json({ message: 'Tour created successfully', tour });
  } catch (error) {
    console.log(error, 'error.message')
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a single tour with images by ID
exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await db.Tour.findByPk(id, {
      include: [{ model: db.TourImage, as: 'tourImages', attributes: { exclude: ['createdAt', 'updatedAt'] } }],
      attributes: { exclude: ['createdAt', 'updatedAt'] },

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
      include: [{ model: db.TourImage, as: 'tourImages', attributes: { exclude: ['createdAt', 'updatedAt'] } }],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getToursForDashboard = async (req, res) => {
  try {
    const tours = await db.Tour.findAll({
      include: [
        {
          model: db.TourImage,
          as: 'tourImages',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          limit: 1, // Get only the first image
        },
        {
          model: db.TourImage,
          as: 'tourImages',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        }
      ],
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

    // Process and save each uploaded image
    if (req.files && req.files.length > 0) {
      // Delete old images
      await db.TourImage.destroy({ where: { tourId: id } });

      const imageRecords = req.files.map((file, index) => {
        return {
          tourId: tour.id,
          name: req.body[`imagesData[${index}]name`],
          url: `/uploads/${file.filename}`,
          order: req.body[`imagesData[${index}]order`],
        };
      });

      // Add new images to the database
      await db.TourImage.bulkCreate(imageRecords);
    }

    res.status(200).json({ message: 'Tour updated successfully', tour });
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
    await db.TourImage.destroy({ where: { tourId: parseInt(id) } });

    // Delete the tour
    await tour.destroy();

    res.status(200).send({message:"tour deleted", success:true});
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

exports.getFullRecordFromTourById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the tour along with its associated tour images and hotspots
    const tour = await db.Tour.findByPk(id, {
      include: [
        {
          model: db.TourImage,
          as: 'tourImages',
          include: [
            {
              model: db.Hotspot,
              as: 'hotspots',
              include: [
                {
                  model: db.HotspotImage,
                  as: 'hotspotImage',
                  attributes: ['url'], // Select the hotspot image URL
                },
                {
                  model: db.TourImage,
                  as: 'linkedTourImage',
                  attributes: ['name'], // Select the linked tour image name
                },
              ],
            },
          ],
        },
      ],
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Structure the response
    const tourResponse = {};

    tour.tourImages.forEach((tourImage) => {
      const sceneName = tourImage.name;
      const scenePanoImg = tourImage.url;

      // Prepare the hotspots array
      const hotSpotsArr = tourImage.hotspots.map((hotspot) => ({
        pitch: hotspot.pitch,
        lable: hotspot.name,
        yaw: hotspot.yaw,
        hfov: hotspot.hfov,
        type: hotspot.type,
        tour_image_id: hotspot.tour_image_id,
        hotspot_image_id: hotspot.hotspot_image_id,
        transition: hotspot.linkedTourImage ? hotspot.linkedTourImage.name : null,
        arrow_image_url: hotspot.hotspotImage ? hotspot.hotspotImage.url : null,
      }));
      // Assigning order property to hotspots
      hotSpotsArr.forEach((hotspot, index) => {
        hotspot.order = index + 1;
      });

      // Construct the scene object
      tourResponse[sceneName] = {
        sceneName: sceneName,
        scenePanoImg: scenePanoImg,
        initPitch: -2.7342254361971903, // Static value as per your example
        initYaw: -71.59834061057227,    // Static value as per your example
        hotSpotsArr: hotSpotsArr,
      };
    });

    res.status(200).json(tourResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getFullRecordFromTourByIdForBackend = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the tour along with its associated tour images and hotspots
    const tour = await db.Tour.findByPk(id, {
      include: [
        {
          model: db.TourImage,
          as: 'tourImages',
          include: [
            {
              model: db.Hotspot,
              as: 'hotspots',
              include: [
                {
                  model: db.HotspotImage,
                  as: 'hotspotImage',
                  attributes: ['url'], // Select the hotspot image URL
                },
                {
                  model: db.TourImage,
                  as: 'linkedTourImage',
                  attributes: ['name'], // Select the linked tour image name
                },
              ],
            },
          ],
        },
      ],
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Structure the response
    const tourResponse = [];

    tour.tourImages.forEach((tourImage, index) => {
      const sceneName = tourImage.name;
      const scenePanoImg = tourImage.url;

      // Prepare the hotspots array
      const hotSpotsArr = tourImage.hotspots.map((hotspot) => ({
        pitch: hotspot.pitch,
        lable: hotspot.name,
        yaw: hotspot.yaw,
        hfov: hotspot.hfov,
        type: hotspot.type,
        tour_image_id: hotspot.tour_image_id,
        hotspot_image_id: hotspot.hotspot_image_id,
        transition: hotspot.linkedTourImage ? hotspot.linkedTourImage.name : null,
        arrow_image_url: hotspot.hotspotImage ? hotspot.hotspotImage.url : null,
      }));
      // Assigning order property to hotspots
      hotSpotsArr.forEach((hotspot, index) => {
        hotspot.order = index + 1;
      });

      // Construct the scene object
      tourResponse[index] = {
        sceneName: sceneName,
        scenePanoImg: scenePanoImg,
        initPitch: -2.7342254361971903, // Static value as per your example
        initYaw: -71.59834061057227,    // Static value as per your example
        hotSpotsArr: hotSpotsArr,
      };
    });

    res.status(200).json(tourResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};