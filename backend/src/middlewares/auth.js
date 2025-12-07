// Utils
const { verifyAccessToken } = require('../utils/jwt');

// Models
const User = require('../models/User');

/**
 * Authentication & Authorization Middleware
 * Handles JWT verification and role-based access control
 */

/**
 * Protect Middleware - Verify JWT Access Token
 * Attaches authenticated user to req.user if token is valid
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  try {
    console.log('🔐 Auth Middleware - Protecting route:', req.method, req.path);
    console.log('🔑 Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('📋 Content-Type:', req.headers['content-type']);
    
    // Get token from Authorization header
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token extracted successfully');
    }

    // Check if token exists
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized, no token provided',
          statusCode: 401
        }
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 401
        }
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: error.message || 'Not authorized, token failed',
        statusCode: 401
      }
    });
  }
};

/**
 * Admin Only Middleware - Check if user has admin role
 * Must be used AFTER protect middleware
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Access denied. Admin privileges required',
        statusCode: 403
      }
    });
  }
};

module.exports = {
  protect,
  adminOnly
};
