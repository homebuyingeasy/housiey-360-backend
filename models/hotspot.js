module.exports = (sequelize, DataTypes) => {
    const Hotspot = sequelize.define('hotspots', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pitch: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      yaw: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hfov: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tour_image_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rotation_angle: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      linked_tour_image_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    });
  
    Hotspot.associate = function(models) {
      Hotspot.belongsTo(models.TourImage, { as: 'tourImage', foreignKey: 'tour_image_id' });
      Hotspot.belongsTo(models.TourImage, { as: 'linkedTourImage', foreignKey: 'linked_tour_image_id' });
    };
  
    return Hotspot;
  };
  