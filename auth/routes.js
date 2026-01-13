const router = require('express').Router();
const AuthController = require('./AuthController');
const authMiddleware = require('./middleware/authMiddleware');

// POST /api/auth/register
router.post('/auth/register', AuthController.register);

// POST /api/auth/login
router.post('/auth/login', AuthController.login);

// POST /api/auth/refresh
router.post('/auth/refresh', AuthController.refresh);

// POST /api/auth/logout
router.post('/auth/logout', authMiddleware, AuthController.logout);

module.exports = router;