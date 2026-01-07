const express = require('express');
const sequelize = require('./db');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

//User router
const UserRoutes = require("./users/routes");

app.use("/user", UserRoutes);


// Running check
app.get('/status', (req, res) => {
    const status = {
        "Status": "Running"
    };
    res.send(status);
});


// Инициализация БД и запуск сервера
const startServer = async () => {
    try {
        // Синхронизация моделей с базой данных
        // force: false - не удаляет существующие таблицы
        // alter: true - обновляет структуру таблиц при изменении моделей
        await sequelize.sync({ force: false });
        console.log('✓ База данных синхронизирована');
        
        // Запуск сервера
        app.listen(PORT, () => {
            console.log(`✓ Сервер запущен на порту: ${PORT}`);
        });
    } catch (error) {
        console.error('✗ Ошибка при запуске сервера:', error);
        process.exit(1);
    }
};

startServer();

