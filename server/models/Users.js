const { Sequelize, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {

        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
              },
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    });

    Users.associate = (models) => {
        Users.hasMany(models.Events, {
            foreignKey: "userId",  // Fix foreign key
            as: "OrganizedEvents", // Optional alias
            onDelete: "CASCADE", 
        });
    
        Users.hasMany(models.Reviews, {
            foreignKey: "userId",
            onDelete: "CASCADE",
        });
    
        // Many-to-Many relationship through UserEvents
        Users.belongsToMany(models.Events, {
            through: models.UserEvents,
            foreignKey: "userId",
            onDelete: "CASCADE",
        });
        
    };
    
    

    return Users;
};