// Core dependencies
const path = require('path');
const fs = require('fs');

// Third-party dependencies
const Joi = require('joi');
const multer = require('multer');

/**
 * User Validation & Upload Configuration
 * Defines Joi validation rules and Multer upload configuration
 * All validation happens before controller logic
 */

// ==================== FILE UPLOAD CONFIGURATION ====================

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/profile-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow JPG and PNG
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are allowed'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter
});

// Export upload middleware
const uploadProfileImage = upload.single('profile_image');

// ==================== REGISTRATION VALIDATION ====================

// ==================== REGISTRATION VALIDATION ====================

/**
 * Registration Schema
 * Validates new user registration data
 */
const registerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.pattern.base': 'Name can only contain alphabets and spaces',
      'any.required': 'Name is required'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),

  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be between 10 and 15 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one number',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),

  address: Joi.string()
    .max(150)
    .allow(null, '')
    .messages({
      'string.max': 'Address cannot exceed 150 characters'
    }),

  state: Joi.string()
    .required()
    .messages({
      'string.empty': 'State is required',
      'any.required': 'State is required'
    }),

  city: Joi.string()
    .required()
    .messages({
      'string.empty': 'City is required',
      'any.required': 'City is required'
    }),

  country: Joi.string()
    .required()
    .messages({
      'string.empty': 'Country is required',
      'any.required': 'Country is required'
    }),

  pincode: Joi.string()
    .pattern(/^\d{4,10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Pincode must be between 4 and 10 digits',
      'string.empty': 'Pincode is required',
      'any.required': 'Pincode is required'
    }),

  profile_image: Joi.string()
    .allow(null, '')
    .messages({
      'string.base': 'Profile image must be a valid file path'
    })
});

// ==================== LOGIN VALIDATION ====================

/**
 * Login Schema
 * Validates user login credentials (email or phone + password)
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email or phone is required'
    }),

  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .messages({
      'string.pattern.base': 'Phone number must be between 10 and 15 digits'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
}).or('email', 'phone') // At least one of email or phone must be present
  .messages({
    'object.missing': 'Either email or phone is required'
  });

// ==================== UPDATE VALIDATION ====================

/**
 * Update User Schema
 * Validates user update data (all fields optional)
 * NOTE: When using multipart/form-data, req.body is populated by multer AFTER validation
 * So this schema validates JSON updates, while multipart updates skip validation
 */
const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.min': 'Name must be at least 3 characters long',
      'string.pattern.base': 'Name can only contain alphabets and spaces'
    }),

  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .messages({
      'string.pattern.base': 'Phone number must be between 10 and 15 digits'
    }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one number'
    }),

  address: Joi.string()
    .max(150)
    .allow(null, '')
    .messages({
      'string.max': 'Address cannot exceed 150 characters'
    }),

  state: Joi.string()
    .messages({
      'string.empty': 'State cannot be empty'
    }),

  city: Joi.string()
    .messages({
      'string.empty': 'City cannot be empty'
    }),

  country: Joi.string()
    .messages({
      'string.empty': 'Country cannot be empty'
    }),

  pincode: Joi.string()
    .pattern(/^\d{4,10}$/)
    .messages({
      'string.pattern.base': 'Pincode must be between 4 and 10 digits'
    }),

  profile_image: Joi.string()
    .allow(null, '')
    .messages({
      'string.base': 'Profile image must be a valid file path'
    }),

  role: Joi.string()
    .valid('user', 'admin')
    .messages({
      'any.only': 'Role must be either user or admin'
    })
}).min(1) // At least one field must be provided for update
  .messages({
    'object.min': 'At least one field must be provided for update'
  });

// ==================== ID & TOKEN VALIDATION ====================

/**
 * User ID Schema
 * Validates MongoDB ObjectId format in route parameters
 */
const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
});

/**
 * Refresh Token Schema
 * Validates refresh token in request body
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required'
    })
});

// ==================== SEARCH & FILTER VALIDATION ====================

/**
 * Search Schema
 * Validates query parameters for user search and filtering
 */
const searchSchema = Joi.object({
  name: Joi.string()
    .allow(''),
  
  email: Joi.string()
    .allow('')
    .messages({
      'string.base': 'Email must be a string'
    }),
  
  state: Joi.string()
    .allow(''),
  
  city: Joi.string()
    .allow(''),
  
  sortBy: Joi.string()
    .valid('name', 'email', 'createdAt', 'state', 'city')
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: name, email, createdAt, state, city'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page number must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

// ==================== EXPORTS ====================

module.exports = {
  // Validation schemas
  registerSchema,
  loginSchema,
  updateUserSchema,
  userIdSchema,
  refreshTokenSchema,
  searchSchema,
  
  // Upload middleware
  uploadProfileImage
};
