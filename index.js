const express = require('express');
const prisma = require('./db');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

//User router
const UserRoutes = require("./users/routes");

app.use("/api", UserRoutes);


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
        await prisma.$connect();
        console.log('✓ База данных подключена');
        
        // Запуск сервера
        app.listen(PORT, () => {
            console.log(`✓ Сервер запущен на порту: ${PORT}`);
        });
    } catch (error) {
        console.error('✗ Ошибка при запуске сервера:', error);
        process.exit(1);
    }
};

process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('✓ База данных отключена');
})

startServer();

