const router = require('express').Router();
const AuthController = require('./AuthController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSchema } = require('../middleware/schemaValidation');
const { loginSchema, registerSchema, refreshTokenSchema } = require('./schemas');

// POST /api/auth/register
router.post('/auth/register', 
  validateSchema(registerSchema, 'body'), 
  AuthController.register
);

// POST /api/auth/login
router.post('/auth/login', 
  validateSchema(loginSchema, 'body'), 
  AuthController.login
);

// POST /api/auth/refresh
router.post('/auth/refresh', 
  validateSchema(refreshTokenSchema, 'cookies'), 
  AuthController.refresh
);

// POST /api/auth/logout
router.post('/auth/logout', authMiddleware, AuthController.logout);

module.exports = router;