module.exports = (sequelize, DataTypes) => {
    const Hotspot = sequelize.define('hotsports', {
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
      hotspot_image_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      linked_tour_image_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    });
  
    Hotspot.associate = (models) => {
      Hotspot.belongsTo(models.TourImage, { foreignKey: 'tour_image_id', as: 'tourImage' });
      Hotspot.belongsTo(models.TourImage, { foreignKey: 'linked_tour_image_id', as: 'linkedTourImage' });
      Hotspot.belongsTo(models.HotspotImage, { foreignKey: 'hotspot_image_id', as: 'hotspotImage' });
    };
  
    return Hotspot;
  };
  