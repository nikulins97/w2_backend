require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser')
const prisma = require('./db');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

const PORT = process.env.PORT || 3000;

//Routers
const UserRoutes = require("./users/routes");
const AuthRoutes = require("./auth/routes")

app.use("/api", UserRoutes);
app.use("/api", AuthRoutes);


// Running check
app.get('/status', (req, res) => {
    const status = {
        "Status": "Running"
    };
    res.send(status);
});


// Init DB and run server
const startServer = async () => {
    try {
        await prisma.$connect();
        logger.info('Database connected');
        
        app.listen(PORT, () => {
            logger.info(`Server is running on port: ${PORT}`);
        });
    } catch (error) {
        logger.error('Launch error', { error });
        process.exit(1);
    }
};

process.on('beforeExit', async () => {
    await prisma.$disconnect();
    logger.info('Database disconnected');
})

startServer();
