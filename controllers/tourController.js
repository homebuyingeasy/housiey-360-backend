const db = require('../models');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize'); // Make sure to import Op for Sequelize operators

// Create a new tour with images and projectLogo
exports.createTour = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Create a new tour
    const newTour = await db.Tour.create({
      name,
      description,
    });

    // Handle project logo
    if (req.files['projectLogo'] && req.files['projectLogo'].length > 0) {
      const logo = req.files['projectLogo'][0];
      newTour.projectLogo = `/uploads/${logo.filename}`;
      await newTour.save();
    }

    // Handle uploaded images
    const images = req.files['images'];
    if (images) {
      const imageRecords = images.map((file, index) => ({
        tourId: newTour.id,
          name: req.body[`imagesData[${index}]name`],
          url: `/uploads/${file.filename}`,
          order: Number(req.body[`imagesData[${index}]order`])
      }));

      // Bulk create the tour images
      await db.TourImage.bulkCreate(imageRecords);
    }

    res.status(201).json({ message: 'Tour created successfully', success: true, tour: newTour });
  } catch (error) {
    console.error('Create Tour Error:', error);
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
  const { name, description } = req.body;

  try {
    const tourId = req.params.id;
    const tour = await db.Tour.findByPk(tourId);

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Update tour basic info
    tour.name = name;
    tour.description = description;

    // Handle project logo
    if (req.files['projectLogo'] && req.files['projectLogo'].length > 0) {
      const logo = req.files['projectLogo'][0];

      if (tour.projectLogo) {
        const logoPath = path.join(__dirname, '..', 'uploads', path.basename(tour.projectLogo));
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }
      }

      tour.projectLogo = `/uploads/${logo.filename}`;
    }

    // Save tour data
    await tour.save();

    // Handle image updates
    const images = req.files['images'];
    const imagesData = req.body.imagesData ? JSON.parse(JSON.stringify(req.body.imagesData)) : {}; // Parse imagesData if sent as a complex key

    if (images && images.length > 0) {
      for (let index = 0; index < images.length; index++) {
        const file = images[index];

        const imageName = imagesData[`${index}`] && imagesData[`${index}`]['name'] 
            ? imagesData[`${index}`]['name'] 
            : file.originalname;
        const imageOrder = imagesData[`${index}`] && imagesData[`${index}`]['order'] 
            ? imagesData[`${index}`]['order'] 
            : index + 1;

        const imageRecord = {
          tourId: tourId,
          url: `/uploads/${file.filename}`,
          name: imageName, // Use the provided image name from imagesData
          order: imageOrder // Use the provided order from imagesData
        };
        await db.TourImage.upsert(imageRecord);
      }
    }

    res.status(200).json({ message: 'Tour updated successfully', success: true });
  } catch (error) {
    console.error('Update Tour Error:', error);
    res.status(500).json({ message: 'Server error', error });
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

    res.status(200).send({ message: "tour deleted", success: true });
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
        label: hotspot.name,
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
                  attributes: ['url', 'id'], // Select the hotspot image URL
                },
                {
                  model: db.TourImage,
                  as: 'linkedTourImage',
                  attributes: ['name', 'id'], // Select the linked tour image name
                },
              ],
            },
          ],
        },
      ],
    });
    console.log(tour)
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    // Structure the response
    const tourResponse = [];

    tour.tourImages.forEach((tourImage, index) => {
      const sceneName = tourImage.name;
      const tourId = tourImage.id;
      const scenePanoImg = tourImage.url;

      // Prepare the hotspots array
      const hotSpotsArr = tourImage.hotspots.map((hotspot) => ({
        id: hotspot.id,
        pitch: hotspot.pitch,
        label: hotspot.name,
        yaw: hotspot.yaw,
        hfov: hotspot.hfov,
        type: hotspot.type,
        tour_image_id: hotspot.tour_image_id,
        hotspot_image_id: hotspot.hotspot_image_id,
        transition: hotspot.linkedTourImage ? hotspot.linkedTourImage.name : null,
        linked_tour_image_id: hotspot.linkedTourImage ? hotspot.linkedTourImage.id : null,
        arrow_image_url: hotspot.hotspotImage ? hotspot.hotspotImage.url : null,
      }));
      // Assigning order property to hotspots
      hotSpotsArr.forEach((hotspot, index) => {
        hotspot.order = index + 1;
      });

      // Construct the scene object
      tourResponse[index] = {
        sceneName: sceneName,
        tourId: tourId,
        scenePanoImg: scenePanoImg,
        initPitch: -2.7342254361971903, // Static value as per your example
        initYaw: -71.59834061057227,    // Static value as per your example
        hotSpotsArr: hotSpotsArr,
        projectLogo:tour.projectLogo
      };
    });

    res.status(200).json(tourResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};