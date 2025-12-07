/**
 * Validation Middleware
 * Wraps Joi schemas for request validation
 */

/**
 * Joi Validation Middleware Wrapper
 * Validates request data against provided Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    // Skip validation for multipart/form-data requests
    // Multer populates req.body after this middleware runs
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      console.log('⏭️  Skipping Joi validation for multipart/form-data request');
      return next();
    }
    
    console.log('✓ Running Joi validation for:', req.method, req.path);
    // Determine what to validate based on request
    const dataToValidate = {
      ...req.body,
      ...req.params,
      ...req.query
    };

    // Validate data against schema
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    // If validation fails, return error response
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: errors
        }
      });
    }

    // Replace request body with validated and sanitized data
    // Note: We only update req.body as req.params and req.query are read-only in Express v5
    req.body = value;

    next();
  };
};

module.exports = validate;