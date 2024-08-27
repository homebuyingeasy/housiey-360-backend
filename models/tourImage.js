module.exports = (sequelize, DataTypes) => {
  const TourImage = sequelize.define(
    'tour_images',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tourId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Tours',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
    }
  );

  // Define associations
  TourImage.associate = (models) => {
    TourImage.belongsTo(models.Tour, { foreignKey: 'tourId', as: 'tours'});
    TourImage.hasMany(models.Hotspot, { foreignKey: 'tour_image_id', as: 'hotspots' });

  };

  return TourImage;
};
