import * as authService from '../services/authService.js';
import * as userManagementService from '../services/userManagementService.js';
import * as adminService from '../services/adminService.js';
import { sanitizePagination, sanitizeFilters } from '../utils/sanitizers.js';

export async function register(call, callback) {
  try {
    const {
      email,
      password,
      username,
      first_name,
      last_name,
      phone,
      role,
      organization,
      ip_address,
      user_agent,
    } = call.request;

    if (!email || !password) {
      return callback({
        code: 3,
        message: 'Email and password are required',
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
      organization,
      ip_address,
      user_agent,
    };

    const result = await authService.register(userData);

    callback(null, {
      success: true,
      user: result.user,
      organization: result.organization,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Register error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

/**
 * User login
 */
export async function login(call, callback) {
  try {
    const { email, password, ip_address, user_agent } = call.request;

    if (!email || !password) {
      return callback({
        code: 3,
        message: 'Email and password are required',
      });
    }

    const sessionData = { ip_address, user_agent };
    const result = await authService.login(email, password, sessionData);

    callback(null, {
      success: true,
      user: result.user,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function logout(call, callback) {
  try {
    const { user_id, session_id } = call.request;

    if (!user_id) {
      return callback({
        code: 3,
        message: 'User ID is required',
      });
    }

    const result = await authService.logout(user_id, session_id);

    callback(null, {
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Logout error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function refreshToken(call, callback) {
  try {
    const { refresh_token } = call.request;

    if (!refresh_token) {
      return callback({
        code: 3,
        message: 'Refresh token is required',
      });
    }

    const result = await authService.refreshToken(refresh_token);

    callback(null, {
      success: true,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      message: 'Token refresh successful',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function validateToken(call, callback) {
  try {
    const { token } = call.request;

    if (!token) {
      return callback({
        code: 3,
        message: 'Token is required',
      });
    }

    const result = await authService.verifyToken(token);

    callback(null, {
      valid: true,
      user: result.user,
    });
  } catch (error) {
    console.error('Validate token error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function changePassword(call, callback) {
  try {
    const { user_id, current_password, new_password } = call.request;

    if (!user_id || !current_password || !new_password) {
      return callback({
        code: 3,
        message: 'User ID, current password and new password are required',
      });
    }

    const result = await authService.changePassword(user_id, current_password, new_password);

    callback(null, {
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Change password error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function resetPassword(call, callback) {
  try {
    const { user_id, new_password } = call.request;

    if (!user_id || !new_password) {
      return callback({
        code: 3,
        message: 'User ID and new password are required',
      });
    }

    const result = await adminService.resetPassword(user_id, new_password);

    callback(null, {
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function getUserProfile(call, callback) {
  try {
    const { user_id } = call.request;

    if (!user_id) {
      return callback({
        code: 3,
        message: 'User ID is required',
      });
    }

    const result = await userManagementService.getUserProfile(user_id);

    callback(null, {
      success: true,
      user: result,
      message: 'User profile retrieved successfully',
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function updateUserProfile(call, callback) {
  try {
    const {
      user_id,
      first_name,
      last_name,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      profile_picture_url,
    } = call.request;

    if (!user_id) {
      return callback({
        code: 3,
        message: 'User ID is required',
      });
    }

    const updateData = {
      first_name,
      last_name,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      profile_picture_url,
    };

    const result = await userManagementService.updateUserProfile(user_id, updateData);

    callback(null, {
      success: true,
      user: result,
      message: 'User profile updated successfully',
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function getUserSessions(call, callback) {
  try {
    const { user_id } = call.request;

    if (!user_id) {
      return callback({
        code: 3,
        message: 'User ID is required',
      });
    }

    const result = await userManagementService.getUserSessions(user_id);

    callback(null, {
      success: true,
      sessions: result,
      message: 'User sessions retrieved successfully',
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function getUsers(call, callback) {
  try {
    const { page, limit, filters } = call.request;

    const sanitizedPagination = sanitizePagination({ page, limit });
    const sanitizedFilters = sanitizeFilters(filters);

    const result = await adminService.getUsers(
      sanitizedPagination.page,
      sanitizedPagination.limit,
      sanitizedFilters
    );

    callback(null, {
      success: true,
      users: result.users,
      pagination: result.pagination,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    console.error('Get users error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function searchUsers(call, callback) {
  try {
    const { search_term, page, limit } = call.request;

    if (!search_term) {
      return callback({
        code: 3,
        message: 'Search term is required',
      });
    }

    const sanitizedPagination = sanitizePagination({ page, limit });
    const result = await adminService.searchUsers(
      search_term,
      sanitizedPagination.page,
      sanitizedPagination.limit
    );

    callback(null, {
      success: true,
      users: result.data,
      pagination: result.pagination,
      message: 'Users search completed successfully',
    });
  } catch (error) {
    console.error('Search users error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function updateUserStatus(call, callback) {
  try {
    const { user_id, status } = call.request;

    if (!user_id || !status) {
      return callback({
        code: 3,
        message: 'User ID and status are required',
      });
    }

    const result = await adminService.updateUserStatus(user_id, status);

    callback(null, {
      success: true,
      user: result,
      message: 'User status updated successfully',
    });
  } catch (error) {
    console.error('Update user status error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}

export async function health(call, callback) {
  try {
    const result = await authService.healthCheck();

    callback(null, {
      status: result.status,
      message: result.status === 'healthy' ? 'Service is healthy' : 'Service is unhealthy',
      details: {
        timestamp: result.timestamp,
        database: result.database,
        service: result.service,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    callback({
      code: 13,
      message: error.message,
    });
  }
}
