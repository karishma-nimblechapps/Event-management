const { Sequelize, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Reviews = sequelize.define("Reviews", {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
              },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true },
        },
        review_text: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: { notEmpty: true },
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        sentiment: {  
            type: DataTypes.STRING,
            allowNull: true, 
        },
        admin_response: {
            type: DataTypes.TEXT,
            allowNull: true, 
        }
    }, { timestamps: true });

    Reviews.associate = (models) => {
        Reviews.belongsTo(models.Events, {
            foreignKey: "eventId",  // ✅ Match SQL script
            onDelete: "CASCADE",
        });
        Reviews.belongsTo(models.Users, {
            foreignKey: "userId",  // ✅ Match SQL script
            onDelete: "CASCADE",
        });
    };

    return Reviews;
};
