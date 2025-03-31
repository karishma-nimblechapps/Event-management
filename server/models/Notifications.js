const { Sequelize, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define("Notifications", {

    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
        },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isAdminNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  Notifications.associate = (models) => {
    Notifications.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Notifications;
};