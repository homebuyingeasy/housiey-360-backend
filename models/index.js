const Sequelize = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: 'mysql',
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./user')(sequelize, Sequelize);
db.Tour = require('./tour')(sequelize, Sequelize);
db.TourImage = require('./tourImage')(sequelize, Sequelize);
db.Hotspot = require('./hotspot')(sequelize, Sequelize);

// Define Associations
// A Tour can have many TourImages
db.Tour.hasMany(db.TourImage, { as: 'tourImages', foreignKey: 'tourId' });
db.TourImage.belongsTo(db.Tour, { as: 'tour', foreignKey: 'tourId' });

// A TourImage can have many Hotspots
db.TourImage.hasMany(db.Hotspot, { as: 'hotspots', foreignKey: 'tour_image_id' });
db.Hotspot.belongsTo(db.TourImage, { as: 'tourImage', foreignKey: 'tour_image_id' });

// A Hotspot can be linked to another TourImage
db.TourImage.hasMany(db.Hotspot, { as: 'linkedHotspots', foreignKey: 'linked_tour_image_id' });
db.Hotspot.belongsTo(db.TourImage, { as: 'linkedTourImage', foreignKey: 'linked_tour_image_id' });


module.exports = db;
