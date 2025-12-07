// Core dependencies
const router = require('express').Router();

// Controllers
const { register, login, refreshToken, logout } = require('../controllers/authController');

// Validation schemas & upload middleware
const { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  uploadProfileImage 
} = require('../validation/userValidation');

// Middlewares
const validate = require('../middlewares/validate');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', 
  uploadProfileImage,
  validate(registerSchema),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  validate(loginSchema),
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  validate(refreshTokenSchema),
  refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear tokens client-side)
 * @access  Public
 */
router.post('/logout',
  logout
);

module.exports = router;
