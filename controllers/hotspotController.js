const db = require('../models');

exports.addHotspot = async (req, res) => {
    try {
        const { pitch, yaw, hfov, type, tour_image_id, name, hotspot_image_id, linked_tour_image_id } = req.body;

        // Validate the input (you can add more validation as needed)

        // Create the hotspot
        const hotspot = await db.Hotspot.create({
            pitch,
            yaw,
            hfov,
            type,
            tour_image_id,
            name,
            hotspot_image_id,
            linked_tour_image_id,
        });

        res.status(201).json(hotspot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHotspotsByTourImageId = async (req, res) => {
    try {
      const { tour_image_id } = req.params;
  
      const hotspots = await db.Hotspot.findAll({
        where: { tour_image_id },
        include: [
          {
            model: db.TourImage,
            as: 'tourImage',
            attributes: ['id', 'url', 'name'],
          },
          {
            model: db.TourImage,
            as: 'linkedTourImage',
            attributes: ['id', 'url', 'name'],
          },
          {
            model: db.HotspotImage,
            as: 'hotspotImage',
            attributes: ['id', 'url', 'image_name'],
          },
        ],
      });
  
      if (!hotspots.length) {
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
        const { pitch, yaw, hfov, type, tour_image_id, name, hotspot_image_id, linked_tour_image_id } = req.body;

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
            hotspot_image_id,
            linked_tour_image_id,
        });

        res.status(200).json(hotspot);
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
