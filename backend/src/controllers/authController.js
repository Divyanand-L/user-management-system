// Models
const User = require('../models/User');

// Utils
const { generateTokens } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, state, city, country, pincode } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return errorResponse(res, 'Email already exists', 409);
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return errorResponse(res, 'Phone number already exists', 409);
    }

    // Handle profile image upload
    let profileImagePath = null;
    if (req.file) {
      // Store only relative path for frontend access
      profileImagePath = `uploads/profile-images/${req.file.filename}`;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      profile_image: profileImagePath,
      address,
      state,
      city,
      country,
      pincode
    });

    // Generate tokens
    const tokens = generateTokens(user._id);

    return successResponse(
      res,
      { user: user.toJSON(), tokens },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    // Find user by email or phone
    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    return successResponse(
      res,
      { user: user.toJSON(), tokens },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token (with token rotation)
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const { verifyRefreshToken, generateTokens } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Generate NEW access token AND NEW refresh token (token rotation)
    const newTokens = generateTokens(decoded.id);

    return successResponse(
      res,
      { 
        tokens: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken  // ← New refresh token (rotation)
        }
      },
      'Tokens refreshed successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (client-side token invalidation)
 * @route   POST /api/auth/logout
 * @access  Public
 * @note    Since JWT is stateless, actual invalidation happens client-side
 *          This endpoint exists for consistency and can be extended with token blacklist
 */
const logout = async (req, res, next) => {
  try {
    // In a production app, you might want to:
    // 1. Add the refresh token to a blacklist/database
    // 2. Clear any server-side sessions
    // For now, we'll just return success and let client clear tokens
    
    return successResponse(
      res,
      null,
      'Logged out successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
