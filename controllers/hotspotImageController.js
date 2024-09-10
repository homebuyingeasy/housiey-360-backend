const db = require('../models');

exports.getHotspotImages = async (req, res) => {
  try {

    const hotspot = await db.HotspotImage.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    if (!hotspot) {
      return res.status(404).json({ message: 'Hotspot image not found.' });
    }

    res.status(200).json(hotspot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
