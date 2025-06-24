import * as authService from '../services/authService.js';

import { validateProfileUpdate } from '../utils/validations.js';
import { sanitizePagination, sanitizeFilters } from '../utils/sanitizers.js';

/**
 * Auth Controller with Functional Approach
 * Uses AuthService functions to handle operations
 */

// ========== REGISTRATION & LOGIN ==========

/**
 * Register new user
 */
export async function register(call, callback) {
  try {
    const { email, password, username, first_name, last_name, phone, role, ip_address, user_agent } = call.request;

    // Validate input
    if (!email || !password) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'Email and password are required'
      });
    }

    const userData = {
      email,
      password,
      username,
      first_name,
      last_name,
      phone,
      role: role || 'user',
      ip_address,
      user_agent
    };

    const result = await authService.register(userData);

    callback(null, {
      success: true,
      user: result.user,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Register error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

/**
 * User login
 */
export async function login(call, callback) {
  try {
    const { email, password, ip_address, user_agent } = call.request;

    // Validate input
    if (!email || !password) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'Email and password are required'
      });
    }

    const sessionData = { ip_address, user_agent };
    const result = await authService.login(email, password, sessionData);

    callback(null, {
      success: true,
      user: result.user,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

/**
 * User logout
 */
export async function logout(call, callback) {
  try {
    const { user_id, session_id } = call.request;

    if (!user_id) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'User ID is required'
      });
    }

    const result = await authService.logout(user_id, session_id);

    callback(null, {
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Logout error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

// ========== TOKEN MANAGEMENT ==========

/**
 * Refresh access token
 */
export async function refreshToken(call, callback) {
  try {
    const { refresh_token } = call.request;

    if (!refresh_token) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'Refresh token is required'
      });
    }

    const result = await authService.refreshToken(refresh_token);

    callback(null, {
      success: true,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      message: 'Token refresh successful'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

/**
 * Validate access token
 */
export async function validateToken(call, callback) {
  try {
    const { token } = call.request;

    if (!token) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'Token is required'
      });
    }

    const result = await authService.verifyToken(token);

    callback(null, {
      valid: true,
      user: result.user
    });
  } catch (error) {
    console.error('Validate token error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

// ========== PASSWORD MANAGEMENT ==========

/**
 * Change password
 */
export async function changePassword(call, callback) {
  try {
    const { user_id, current_password, new_password } = call.request;

    if (!user_id || !current_password || !new_password) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'User ID, current password and new password are required'
      });
    }

    const result = await authService.changePassword(user_id, current_password, new_password);

    callback(null, {
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Change password error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

/**
 * Reset password
 */
export async function resetPassword(call, callback) {
  try {
    const { token, new_password } = call.request;

    if (!token || !new_password) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'Token and new password are required'
      });
    }

    const result = await authService.resetPassword(token, new_password);

    callback(null, {
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Reset password error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

// ========== USER MANAGEMENT ==========

/**
 * Get user profile
 */
export async function getUserProfile(call, callback) {
  try {
    const { user_id } = call.request;

    if (!user_id) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'User ID is required'
      });
    }

    const result = await authService.getUserProfile(user_id);

    callback(null, {
      success: true,
      user: result.user,
      message: 'User profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(call, callback) {
  try {
    const { user_id, ...updateData } = call.request;

    if (!user_id) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'User ID is required'
      });
    }

    // Validate update data
    const validationResult = validateProfileUpdate(updateData);
    if (!validationResult.isValid) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: validationResult.errors.join(', ')
      });
    }

    const result = await authService.updateUserProfile(user_id, updateData);

    callback(null, {
      success: true,
      user: result.user,
      message: 'User profile updated successfully'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

/**
 * Get user sessions
 */
export async function getUserSessions(call, callback) {
  try {
    const { user_id } = call.request;

    if (!user_id) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'User ID is required'
      });
    }

    const result = await authService.getUserSessions(user_id);

    callback(null, {
      success: true,
      sessions: result.sessions,
      message: 'User sessions retrieved successfully'
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

// ========== ADMIN OPERATIONS ==========

/**
 * Get all users (admin only)
 */
export async function getUsers(call, callback) {
  try {
    const { page, limit, filters } = call.request;

    const sanitizedPagination = sanitizePagination({ page, limit });
    const sanitizedFilters = sanitizeFilters(filters);

    const result = await authService.getUsers(sanitizedPagination, sanitizedFilters);

    callback(null, {
      success: true,
      users: result.users,
      pagination: result.pagination,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Get users error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

/**
 * Search users (admin only)
 */
export async function searchUsers(call, callback) {
  try {
    const { query, page, limit, filters } = call.request;

    if (!query) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'Search query is required'
      });
    }

    const sanitizedPagination = sanitizePagination({ page, limit });
    const sanitizedFilters = sanitizeFilters(filters);

    const result = await authService.searchUsers(query, sanitizedPagination, sanitizedFilters);

    callback(null, {
      success: true,
      users: result.users,
      pagination: result.pagination,
      message: 'Users search completed successfully'
    });
  } catch (error) {
    console.error('Search users error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

/**
 * Update user status (admin only)
 */
export async function updateUserStatus(call, callback) {
  try {
    const { user_id, status, reason } = call.request;

    if (!user_id || !status) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'User ID and status are required'
      });
    }

    const result = await authService.updateUserStatus(user_id, status, reason);

    callback(null, {
      success: true,
      user: result.user,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

// ========== HEALTH CHECK ==========

/**
 * Health check endpoint
 */
export async function health(call, callback) {
  try {
    const timestamp = new Date().toISOString();
    
    callback(null, {
      status: 'healthy',
      timestamp: timestamp
    });
  } catch (error) {
    console.error('Health check error:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}