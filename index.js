require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser')
const prisma = require('./db');

const app = express();

app.use(express.json());
app.use(cookieParser());

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
        console.log('✓ Database connected');
        
        app.listen(PORT, () => {
            console.log(`✓ Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error('✗ Launch error:', error);
        process.exit(1);
    }
};

process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('✓ Database disconnected');
})

startServer();

