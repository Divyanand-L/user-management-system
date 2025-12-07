/**
 * Application Constants
 * Centralized configuration values and magic numbers
 */

module.exports = {
  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_EXPIRY: '1h',
    REFRESH_TOKEN_EXPIRY: '7d',
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB in bytes
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
    UPLOAD_DIR: 'uploads/profile-images',
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};
