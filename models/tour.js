module.exports = (sequelize, DataTypes) => {
  const Tour = sequelize.define(
    'tours',
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
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      projectLogo: {
        type: DataTypes.STRING,
        allowNull: true // Store the logo image path
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    }
  );

 // Define associations
  Tour.associate = (models) => {
    Tour.hasMany(models.TourImage, { foreignKey: 'tourId', as: 'tourImages', onDelete: 'CASCADE'});
  };


  return Tour;
};
