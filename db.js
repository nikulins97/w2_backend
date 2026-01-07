const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "w2.db",
    define: {
        timestamps: false
    }
});

// Экспортируем sequelize для использования в других файлах
module.exports = sequelize;