/**
 * Response Utility Functions
 * Standardizes API responses across the application
 */

/**
 * Send Success Response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send in response
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default 200)
 * @returns {Object} JSON response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default 500)
 * @param {Object} errors - Additional error details (optional)
 */
const errorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    error: {
      message,
      statusCode
    }
  };

  if (errors) {
    response.error.details = errors;
  }

  if (process.env.NODE_ENV === 'development' && errors && errors.stack) {
    response.error.stack = errors.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};
