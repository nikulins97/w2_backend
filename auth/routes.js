const router = require('express').Router();
const prisma = require('../db');
const UserRepository = require('../users/UserRepository');
const AuthService = require('./AuthService');
const AuthController = require('./AuthController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSchema } = require('../middleware/schemaValidation');
const { loginSchema, registerSchema, refreshTokenSchema } = require('./schemas');

const repo = new UserRepository(prisma);
const service = new AuthService(repo);
const controller = new AuthController(service);

// POST /api/auth/register
router.post('/auth/register',
    validateSchema(registerSchema, 'body'),
    (req, res) => controller.register(req, res)
);

// POST /api/auth/login
router.post('/auth/login',
    validateSchema(loginSchema, 'body'),
    (req, res) => controller.login(req, res)
);

// POST /api/auth/refresh
router.post('/auth/refresh',
    validateSchema(refreshTokenSchema, 'cookies'),
    (req, res) => controller.refresh(req, res)
);

// POST /api/auth/logout
router.post('/auth/logout', authMiddleware, (req, res) => controller.logout(req, res));

module.exports = router;
