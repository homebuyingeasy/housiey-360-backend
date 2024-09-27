const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'users',
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
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: 'Please enter a valid email address.',
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            resetPasswordToken: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            resetPasswordExpires: {
                type: DataTypes.DATE,
                allowNull: true,
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
            hooks: {
                beforeCreate: async (user) => {
                    if (user.password) {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                },
            },
        }
    );

    User.prototype.validatePassword = async function (password) {
        return bcrypt.compare(password, this.password);
    };

    return User;
};