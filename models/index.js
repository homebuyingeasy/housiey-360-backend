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

// Associations
db.Tour.hasMany(db.TourImage, { foreignKey: 'tourId', as: 'tourImages' });
db.TourImage.belongsTo(db.Tour, { foreignKey: 'tourId', as: 'tours' });

db.TourImage.hasMany(db.Hotspot, { foreignKey: 'tour_image_id', as: 'hotspots' });
db.Hotspot.belongsTo(db.TourImage, { foreignKey: 'tour_image_id', as: 'tourImage' });
db.Hotspot.belongsTo(db.TourImage, { foreignKey: 'linked_tour_image_id', as: 'linkedTourImage' });

module.exports = db;
