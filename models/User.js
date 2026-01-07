const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// Определяем модель User
const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
}, {
    tableName: 'users', // имя таблицы в БД
});

// Экспортируем модель
module.exports = User;