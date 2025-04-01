const { sequelize,UUIDV4 } = require("sequelize");

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
            onDelete: "CASCADE",
        },
        eventId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Events",
                key: "id",
            },
            onDelete: "CASCADE"
        },
    },{timestamps: true});

    // Associations
    UserEvents.associate = (models) => {
        UserEvents.belongsTo(models.Users, {
            foreignKey: "userId",
            as: "User",  // Use a unique alias
            onDelete: "CASCADE",
        });
    
        UserEvents.belongsTo(models.Events, {
            foreignKey: "eventId",
            as: "Event",  // Use a unique alias
            onDelete: "CASCADE",
        });
    };
    
    return UserEvents;
};
