const { Sequelize, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Events = sequelize.define("Events", {

        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        time: {  // Time column (for event's start time)
            type: DataTypes.TIME,
            allowNull: false,  // Make time required for each event
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {  // Category column (for event's category)
            type: DataTypes.STRING,
            allowNull: false,  // Make category required
        },
        image: {  // Image column (to store the path/URL to the event's image)
            type: DataTypes.STRING,
            allowNull: true,  // Image is optional for each event
        }
    });

    Events.associate = (models) => {
        Events.hasMany(models.Reviews, {
            foreignKey: "eventId",
            onDelete: "CASCADE",
        });
    
        Events.hasOne(models.EventAnalytics, {
            foreignKey: "eventId",
            onDelete: "CASCADE",
        });

        Events.belongsToMany(models.Users, {
            through: models.UserEvents,
            foreignKey: "eventId",
            onDelete: "CASCADE",
        });

        Events.belongsTo(models.Users, {
            foreignKey: "userId",
            as: "Organizer",  // Optional alias
            onDelete: "CASCADE",
        });
        
    };
    
    


    return Events;
};
