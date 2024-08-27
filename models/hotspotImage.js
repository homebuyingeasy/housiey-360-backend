module.exports = (sequelize, DataTypes) => {
    const HotspotImage = sequelize.define('hotspot_images', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    HotspotImage.associate = (models) => {
      HotspotImage.hasMany(models.Hotspot, { foreignKey: 'hotspot_image_id', as: 'hotspots' });
    };
  
    return HotspotImage;
  };
  