import { validationResult } from 'express-validator';
import logger from './logger.js';

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} True if validation passed, false if failed
 */
export const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation Error',
      details: errors.array(),
      correlationId: req.correlationId
    });
    return false;
  }
  return true;
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @param {string} correlationId - Correlation ID
 */
export const sendSuccessResponse = (res, statusCode, data, correlationId) => {
  res.status(statusCode).json({
    ...data,
    correlationId
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error message
 * @param {string} correlationId - Correlation ID
 * @param {Object} details - Additional error details
 */
export const sendErrorResponse = (res, statusCode, error, correlationId, details = null) => {
  const response = {
    error,
    correlationId
  };

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle gRPC errors and map to HTTP status codes
 * @param {Object} res - Express response object
 * @param {Error} error - gRPC error
 * @param {string} correlationId - Correlation ID
 * @param {string} serviceName - Service name for logging
 * @param {string} methodName - Method name for logging
 * @param {Object} errorMapping - Custom error mapping
 */
export const handleGrpcError = (res, error, correlationId, serviceName, methodName, errorMapping = {}) => {
  // Log error
  logger.error(`${serviceName} ${methodName} error`, {
    error: error.message,
    code: error.code,
    correlationId
  });

  // Default error mappings
  const defaultMapping = {
    3: { status: 400, message: 'Invalid request data' }, // INVALID_ARGUMENT
    5: { status: 404, message: 'Resource not found' },   // NOT_FOUND
    6: { status: 409, message: 'Resource already exists' }, // ALREADY_EXISTS
    7: { status: 403, message: 'Permission denied' },    // PERMISSION_DENIED
    9: { status: 400, message: 'Operation failed' },     // FAILED_PRECONDITION
    10: { status: 402, message: 'Operation aborted' },   // ABORTED
    16: { status: 401, message: 'Unauthorized' }         // UNAUTHENTICATED
  };

  // Merge with custom mapping
  const mapping = { ...defaultMapping, ...errorMapping };
  
  const errorInfo = mapping[error.code] || { status: 500, message: 'Internal Server Error' };
  
  sendErrorResponse(res, errorInfo.status, errorInfo.message, correlationId);
};

/**
 * Create a handler wrapper with common error handling
 * @param {Function} handler - The handler function
 * @param {string} serviceName - Service name for logging
 * @param {string} methodName - Method name for logging
 * @param {Object} errorMapping - Custom error mapping
 * @returns {Function} Wrapped handler function
 */
export const createHandler = (handler, serviceName, methodName, errorMapping = {}) => {
  return async (req, res) => {
    try {
      // Handle validation if needed
      if (!handleValidation(req, res)) {
        return;
      }

      // Call the actual handler
      await handler(req, res);

    } catch (error) {
      handleGrpcError(res, error, req.correlationId, serviceName, methodName, errorMapping);
    }
  };
};

/**
 * Create a simple handler wrapper (without validation)
 * @param {Function} handler - The handler function
 * @param {string} serviceName - Service name for logging
 * @param {string} methodName - Method name for logging
 * @param {Object} errorMapping - Custom error mapping
 * @returns {Function} Wrapped handler function
 */
export const createSimpleHandler = (handler, serviceName, methodName, errorMapping = {}) => {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleGrpcError(res, error, req.correlationId, serviceName, methodName, errorMapping);
    }
  };
}; 