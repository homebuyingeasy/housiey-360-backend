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

  TourImage.associate = function (models) {
    TourImage.hasMany(models.Hotspot, { as: 'hotspots', foreignKey: 'tour_image_id' });
    TourImage.belongsTo(models.Tour, { foreignKey: 'tourId', as: 'tours' });

  };
  return TourImage;
};
