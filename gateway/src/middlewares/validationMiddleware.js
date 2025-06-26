import { body } from 'express-validator';

/**
 * Validation middleware for user registration
 */
export const validateRegistration = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
];

/**
 * Validation middleware for user login
 */
export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation middleware for token refresh
 */
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isJWT()
    .withMessage('Invalid refresh token format'),
];

/**
 * Validation middleware for user profile update
 */
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
];

/**
 * Validation middleware for password change
 */
export const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
];

/**
 * Validation middleware for booking creation
 */
export const validateBooking = [
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isUUID()
    .withMessage('Invalid event ID format'),
  body('ticketQuantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Ticket quantity must be between 1 and 10'),
  body('bookingDate').isISO8601().withMessage('Invalid booking date format'),
];

/**
 * Validation middleware for payment
 */
export const validatePayment = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isUUID()
    .withMessage('Invalid booking ID format'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
];

/**
 * Validation middleware for event creation
 */
export const validateEvent = [
  body('title')
    .notEmpty()
    .withMessage('Event title is required')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Event title must be between 5 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Event description is required')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Event description must be between 10 and 1000 characters'),
  body('date').isISO8601().withMessage('Invalid event date format'),
  body('venue').notEmpty().withMessage('Event venue is required').trim(),
  body('capacity').isInt({ min: 1 }).withMessage('Event capacity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Event price must be non-negative'),
];

/**
 * Validation middleware for user profile update
 */
export const validateUserProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth format'),
  body('address').optional().isObject().withMessage('Address must be an object'),
];

/**
 * Validation middleware for user address creation
 */
export const validateUserAddress = [
  body('street')
    .notEmpty()
    .withMessage('Street address is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address must not exceed 200 characters'),
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('state')
    .notEmpty()
    .withMessage('State is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  body('zipCode')
    .notEmpty()
    .withMessage('ZIP code is required')
    .trim()
    .isLength({ max: 20 })
    .withMessage('ZIP code must not exceed 20 characters'),
  body('country')
    .notEmpty()
    .withMessage('Country is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
];

/**
 * Validation middleware for user address update
 */
export const validateUserAddressUpdate = [
  body('street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address must not exceed 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  body('zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('ZIP code must not exceed 20 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
];

/**
 * Validation middleware for OAuth registration
 */
export const validateOAuthRegistration = [
  body('provider')
    .isIn(['google', 'facebook', 'github'])
    .withMessage('Provider must be one of: google, facebook, github'),
  body('token')
    .notEmpty()
    .withMessage('OAuth token is required')
    .isLength({ min: 10 })
    .withMessage('OAuth token must be at least 10 characters long'),
  body('access_token')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Access token must be at least 10 characters long'),
  body('refresh_token')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Refresh token must be at least 10 characters long'),
  body('expires_at')
    .optional()
    .isInt({ min: Date.now() })
    .withMessage('Expires at must be a valid future timestamp'),
];
