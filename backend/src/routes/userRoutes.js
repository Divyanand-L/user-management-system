// Core dependencies
const router = require('express').Router();

// Controllers
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getMyProfile,
  setupAdmin,
  promoteToAdmin,
  demoteFromAdmin
} = require('../controllers/userController');

// Validation schemas & upload middleware
const { 
  userIdSchema, 
  updateUserSchema, 
  searchSchema,
  uploadProfileImage 
} = require('../validation/userValidation');

// Middlewares
const validate = require('../middlewares/validate');
const { protect, adminOnly } = require('../middlewares/auth');

/**
 * @route   GET /api/users/profile/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile/me',
  protect,
  getMyProfile
);

/**
 * @route   GET /api/users
 * @desc    Get all users with search/filter
 * @access  Private/Admin
 */
router.get('/',
  protect,
  adminOnly,
  validate(searchSchema),
  getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id',
  protect,
  validate(userIdSchema),
  getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private
 */
router.put('/:id',
  protect,
  uploadProfileImage,
  validate(updateUserSchema),
  updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (own profile or admin deletes anyone)
 * @access  Private
 */
router.delete('/:id',
  protect,
  validate(userIdSchema),
  deleteUser
);

/**
 * @route   POST /api/users/setup-admin
 * @desc    Setup admin using secret key
 * @access  Private (requires ADMIN_SETUP_KEY in body)
 */
router.post('/setup-admin',
  protect,
  setupAdmin
);

/**
 * @route   PATCH /api/users/:id/promote-admin
 * @desc    Promote user to admin (admin only)
 * @access  Private/Admin
 */
router.patch('/:id/promote-admin',
  protect,
  adminOnly,
  validate(userIdSchema),
  promoteToAdmin
);

/**
 * @route   PATCH /api/users/:id/demote-admin
 * @desc    Demote admin to user (admin only)
 * @access  Private/Admin
 */
router.patch('/:id/demote-admin',
  protect,
  adminOnly,
  validate(userIdSchema),
  demoteFromAdmin
);

module.exports = router;
