const { Sequelize, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const UserEvents = sequelize.define("UserEvents", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
        },
        eventId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Events",
                key: "id",
            },
        },
    }, { timestamps: true });

    return UserEvents;
};
