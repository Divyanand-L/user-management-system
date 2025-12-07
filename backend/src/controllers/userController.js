// Core dependencies
const fs = require('fs');
const path = require('path');

// Models
const User = require('../models/User');

// Utils
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get all users with search/filter, pagination & sorting
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      state, 
      city, 
      page = 1, 
      limit = 10,
      sortBy = 'name',      // Default sort by name
      sortOrder = 'asc'     // Default ascending (A-Z)
    } = req.query;

    // Build query object for filtering
    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Build sort object
    const sortOptions = {};
    const validSortFields = ['name', 'email', 'createdAt', 'state', 'city'];
    
    // Validate sortBy field
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1; // Default to name ascending
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    // Execute query with pagination and sorting
    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)    // Sort by specified field
      .limit(parsedLimit)   // Limit results per page
      .skip(skip)           // Skip for pagination
      .lean();              // Convert to plain JS objects (better performance)

    // Get total count for pagination metadata
    const total = await User.countDocuments(query);

    return successResponse(
      res,
      {
        users,
        pagination: {
          currentPage: parsedPage,
          totalPages: Math.ceil(total / parsedLimit),
          totalUsers: total,
          limit: parsedLimit,
          hasNextPage: parsedPage < Math.ceil(total / parsedLimit),
          hasPrevPage: parsedPage > 1
        },
        sorting: {
          sortBy,
          sortOrder
        }
      },
      'Users retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, 'User retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUser = async (req, res, next) => {
  try {
    console.log('═══════════════════════════════════════');
    console.log('📝 UPDATE USER REQUEST STARTED');
    console.log('═══════════════════════════════════════');
    console.log('🆔 User ID:', req.params.id);
    console.log('👤 Authenticated User:', req.user?.email);
    console.log('📋 Request Body:', req.body);
    console.log('📷 Has File:', !!req.file);
    if (req.file) {
      console.log('📁 File Details:', {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
    console.log('═══════════════════════════════════════');

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      console.log('❌ User not found:', req.params.id);
      return errorResponse(res, 'User not found', 404);
    }

    console.log('✅ Found user:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Handle profile image upload
    if (req.file) {
      console.log('📷 Processing image upload');
      // Delete old image if exists
      if (user.profile_image) {
        const oldImagePath = path.join(__dirname, '../../', user.profile_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('🗑️ Deleted old image');
        }
      }
      // Store only relative path for frontend access
      req.body.profile_image = `uploads/profile-images/${req.file.filename}`;
    }

    // Don't allow password updates through this endpoint
    delete req.body.password;
    delete req.body.role; // Prevent role changes through regular update

    console.log('🔒 After security cleanup:', req.body);

    // Update user fields individually to avoid validation issues
    const fieldsToUpdate = ['name', 'phone', 'address', 'state', 'city', 'country', 'pincode', 'profile_image'];
    const updatedFields = [];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        const oldValue = user[field];
        const newValue = req.body[field];
        
        // Only update if value actually changed OR force update to ensure save
        if (oldValue !== newValue) {
          user[field] = newValue;
          user.markModified(field); // Force Mongoose to track this change
          updatedFields.push({ field, oldValue, newValue, changed: true });
        } else {
          updatedFields.push({ field, oldValue, newValue, changed: false });
        }
      }
    });

    console.log('📊 Fields being updated:', updatedFields);
    
    // If no fields changed, still return success
    const changedFields = updatedFields.filter(f => f.changed);
    if (changedFields.length === 0) {
      console.log('ℹ️  No fields changed, skipping save');
      const updatedUser = await User.findById(user._id).select('-password');
      console.log('📤 Returning current user (no changes)');
      console.log('═══════════════════════════════════════');
      console.log('✅ UPDATE USER REQUEST COMPLETED (NO CHANGES)');
      console.log('═══════════════════════════════════════\n');
      return successResponse(res, { user: updatedUser }, 'User data unchanged', 200);
    }

    console.log('💾 Saving user to database...');
    console.log('🔄 Fields marked as modified:', changedFields.map(f => f.field));
    const savedUser = await user.save();
    console.log('✅ User saved successfully! Modified paths:', savedUser.modifiedPaths());

    // Fetch the updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    console.log('📤 Returning updated user:', {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      updatedAt: updatedUser.updatedAt
    });
    console.log('═══════════════════════════════════════');
    console.log('✅ UPDATE USER REQUEST COMPLETED');
    console.log('═══════════════════════════════════════\n');

    return successResponse(res, { user: updatedUser }, 'User updated successfully', 200);
  } catch (error) {
    console.error('═══════════════════════════════════════');
    console.error('❌ UPDATE USER ERROR');
    console.error('═══════════════════════════════════════');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.stack) console.error('Stack Trace:', error.stack);
    console.error('═══════════════════════════════════════\n');
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (own profile) / Admin (any profile)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if user is deleting their own account or is admin
    const isOwnAccount = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnAccount && !isAdmin) {
      return errorResponse(res, 'Access denied. You can only delete your own account', 403);
    }

    // Delete profile image if exists
    if (user.profile_image) {
      try {
        const imagePath = path.join(__dirname, '../../', user.profile_image);
        
        // Log for debugging
        console.log('🗑️  Attempting to delete image:', imagePath);
        console.log('📁 File exists:', fs.existsSync(imagePath));
        
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('✅ Image deleted successfully');
        } else {
          console.log('⚠️  Image file not found at path');
        }
      } catch (imgError) {
        console.error('❌ Error deleting image:', imgError.message);
        // Continue with user deletion even if image deletion fails
      }
    }

    await User.findByIdAndDelete(req.params.id);

    return successResponse(res, null, 'User deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile/me
 * @access  Private
 */
const getMyProfile = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user }, 'Profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Setup admin using secret key (first-time setup)
 * @route   POST /api/users/setup-admin
 * @access  Private (requires ADMIN_SETUP_KEY)
 */
const setupAdmin = async (req, res, next) => {
  try {
    const { setupKey } = req.body;

    // Verify setup key
    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return errorResponse(res, 'Invalid admin setup key', 401);
    }

    // Make the logged-in user an admin
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role: 'admin' },
      { new: true, runValidators: true }
    ).select('-password');

    return successResponse(res, { user }, 'You are now an admin', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Promote user to admin (admin only)
 * @route   PATCH /api/users/:id/promote-admin
 * @access  Private/Admin
 */
const promoteToAdmin = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, 'User promoted to admin successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Demote admin to user (admin only)
 * @route   PATCH /api/users/:id/demote-admin
 * @access  Private/Admin
 */
const demoteFromAdmin = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'user' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, 'Admin privileges removed successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMyProfile,
  setupAdmin,
  promoteToAdmin,
  demoteFromAdmin
};
