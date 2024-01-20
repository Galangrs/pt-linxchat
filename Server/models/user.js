"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.hasMany(models.Cart, {
                foreignKey: "userId",
            });
            User.hasMany(models.Chat, {
                foreignKey: "senderId",
            });
            User.hasMany(models.Chat, {
                foreignKey: "receiverId",
            });
            User.hasMany(models.Product, {
                foreignKey: "userId",
            });
        }
    }
    User.init(
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    msg: "Username must be unique",
                },
                validate: {
                    notNull: {
                        msg: "Username is required",
                    },
                    notEmpty: {
                        msg: "Username is required",
                    },
                },
                isOneWord(value) {
                    if (!/^[a-zA-Z0-9]+$/.test(value)) {
                        throw new Error(
                            "Username must contain only letters (A-Z, a-z) and numbers (0-9)"
                        );
                    }
                },
            },
            password: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "User",
        }
    );
    return User;
};
