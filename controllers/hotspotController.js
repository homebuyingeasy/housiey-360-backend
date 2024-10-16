const db = require('../models');

exports.addHotspot = async (req, res) => {
  try {
    const { pitch, yaw, hfov, type, tour_image_id, name, rotation_angle, linked_tour_image_id } = req.body;

    // Check if tour_image_id exists
    const tourImage = await db.TourImage.findByPk(tour_image_id);
    if (!tourImage) {
      return res.status(400).json({ message: 'Invalid tour_image_id' });
    }

    // If linked_tour_image_id is provided, check if it exists
    let linkedTourImage = null;
    if (linked_tour_image_id) {
      linkedTourImage = await db.TourImage.findByPk(linked_tour_image_id);
      if (!linkedTourImage) {
        return res.status(400).json({ message: 'Invalid linked_tour_image_id' });
      }
    }

    // Create the hotspot
    const hotspot = await db.Hotspot.create({
      pitch,
      yaw,
      hfov,
      type,
      tour_image_id,
      name,
      rotation_angle,
      linked_tour_image_id: linkedTourImage ? linkedTourImage.id : null // Ensure linked_tour_image_id is null if not valid
    });

    res.status(201).json({success: true, message: 'New Hotspot created', hotspot});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHotspotsByTourImageId = async (req, res) => {
  try {
    const { tour_image_id } = req.params;

    // Find all hotspots by tour_image_id with associated models
    const hotspots = await db.Hotspot.findAll({
      where: { tour_image_id },
      include: [
        {
          model: db.TourImage,
          as: 'tourImage',  // Make sure the alias matches the one defined in the association
          attributes: ['id', 'url', 'name'],
        },
        {
          model: db.TourImage,
          as: 'linkedTourImage',  // Make sure the alias matches the one defined in the association
          attributes: ['id', 'url', 'name'],
        }
      ],
    });

    if (hotspots.length === 0) {
      return res.status(404).json({ message: 'No hotspots found for this tour image.' });
    }

    res.status(200).json(hotspots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
  
exports.getHotspotById = async (req, res) => {
    try {
        const { id } = req.params;

        const hotspot = await db.Hotspot.findByPk(id);

        if (!hotspot) {
            return res.status(404).json({ message: 'Hotspot not found.' });
        }

        res.status(200).json(hotspot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateHotspot = async (req, res) => {
    try {
        const { id } = req.params;
        const { pitch, yaw, hfov, type, tour_image_id, name, rotation_angle, linked_tour_image_id } = req.body;

        const hotspot = await db.Hotspot.findByPk(id);

        if (!hotspot) {
            return res.status(404).json({ message: 'Hotspot not found.' });
        }

        // Update hotspot details
        await hotspot.update({
            pitch,
            yaw,
            hfov,
            type,
            tour_image_id,
            name,
            rotation_angle,
            linked_tour_image_id,
        });

        res.status(200).json({success: true, message: 'Hotspot update', hotspot});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteHotspot = async (req, res) => {
    try {
        const { id } = req.params;

        const hotspot = await db.Hotspot.findByPk(id);

        if (!hotspot) {
            return res.status(404).json({ message: 'Hotspot not found.' });
        }

        // Delete the hotspot
        await hotspot.destroy();

        res.status(200).json({ message: 'Hotspot deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
