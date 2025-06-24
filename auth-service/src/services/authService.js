import { v4 as uuidv4 } from 'uuid';
import UserRepository from '../repositories/userRepository.js';
import { checkDatabaseHealth } from '../config/databaseConfig.js';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { validateRegistration, validatePasswordChange } from '../utils/validations.js';
import { sanitizeUserInput, sanitizeUserForResponse, sanitizeSessionData } from '../utils/sanitizers.js';

// Initialize user repository (singleton pattern)
const userRepository = new UserRepository();

// Configuration constants

// ========== REGISTRATION & LOGIN ==========

/**
 * Register new user
 */
export async function register(userData) {
  try {
    const validation = validateRegistration(userData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const sanitizedData = sanitizeUserInput(userData);

    const existingUser = await userRepository.findByEmail(sanitizedData.email);
    if (existingUser) {
      throw new Error('Email is already in use');
    }

    if (sanitizedData.username) {
      const existingUsername = await userRepository.findByUsername(sanitizedData.username);
      if (existingUsername) {
        throw new Error('Username is already in use');
      }
    }

    const newUser = await userRepository.createUser({
      ...sanitizedData,
      status: 'active',
      role: sanitizedData.role || 'user'
    });

    const tokens = generateTokens(newUser.id, {
      email: newUser.email,
      role: newUser.role
    });

    await userRepository.createUserSession(newUser.id, {
      session_id: uuidv4(),
      refresh_token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ip_address: userData.ip_address,
      user_agent: userData.user_agent
    });

    return {
      user: sanitizeUserForResponse(newUser),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

/**
 * User login
 */
export async function login(email, password, sessionData = {}) {
  try {
    // Sanitize session data
    const sanitizedSessionData = sanitizeSessionData(sessionData);

    // Verify credentials
    const user = await userRepository.verifyCredentials(email, password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check user status
    if (user.status !== 'active') {
      throw new Error('Account is locked or not activated');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await generateTokens(user.id, {
      email: user.email,
      role: user.role
    });

    // Create session
    await userRepository.createUserSession(user.id, {
      session_id: uuidv4(),
      refresh_token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ip_address: sanitizedSessionData.ip_address,
      user_agent: sanitizedSessionData.user_agent
    });

    return {
      user: sanitizeUserForResponse(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

/**
 * User logout
 */
export async function logout(userId, sessionId = null) {
  try {
    if (sessionId) {
      // Delete specific session
      await userRepository.deleteUserSession(sessionId);
    } else {
      // Delete all user sessions
      await userRepository.deleteAllUserSessions(userId);
    }

    return { message: 'Logout successful' };
  } catch (error) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

// ========== TOKEN MANAGEMENT ==========

/**
 * Generate access token and refresh token
 */
export async function generateTokensForUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error('User does not exist');
  }

  return await generateTokens(userId, {
    email: user.email,
    role: user.role
  });
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken) {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in session
    const sessions = await userRepository.getUserSessions(decoded.userId);
    const validSession = sessions.find(session => session.refresh_token === refreshToken);
    
    if (!validSession) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await generateTokensForUser(decoded.userId);

    // Update session with new refresh token
    await userRepository.updateUserSession(validSession.id, {
      refresh_token: tokens.refreshToken,
      updated_at: new Date()
    });

    return tokens;
  } catch (error) {
    throw new Error(`Refresh token failed: ${error.message}`);
  }
}

/**
 * Verify access token
 */
export async function verifyToken(token) {
  try {
    const decoded = verifyAccessToken(token);
    
    // Check if user exists and is active
    const user = await userRepository.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      throw new Error('Invalid user');
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      user: sanitizeUserForResponse(user)
    };
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
}

// ========== PASSWORD MANAGEMENT ==========

/**
 * Change password
 */
export async function changePassword(userId, currentPassword, newPassword) {
  try {
    // Validate password change
    const validation = validatePasswordChange(currentPassword, newPassword);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Verify current password
    const isValidPassword = await userRepository.verifyPassword(userId, currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await userRepository.updatePassword(userId, newPassword);

    // Delete all sessions to force re-login
    await userRepository.deleteAllUserSessions(userId);

    return { message: 'Password changed successfully' };
  } catch (error) {
    throw new Error(`Password change failed: ${error.message}`);
  }
}

/**
 * Reset password (for admin)
 */
export async function resetPassword(userId, newPassword) {
  try {
    await userRepository.updatePassword(userId, newPassword);
    await userRepository.deleteAllUserSessions(userId);
    
    return { message: 'Password reset successful' };
  } catch (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
}

// ========== USER MANAGEMENT ==========

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  try {
    const user = await userRepository.getUserProfile(userId);
    if (!user) {
      throw new Error('User does not exist');
    }

    return sanitizeUserForResponse(user);
  } catch (error) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updateData) {
  try {
    const sanitizedData = sanitizeUserInput(updateData);
    const updatedUser = await userRepository.updateUser(userId, sanitizedData);
    return sanitizeUserForResponse(updatedUser);
  } catch (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}

/**
 * Get user sessions
 */
export async function getUserSessions(userId) {
  try {
    return await userRepository.getUserSessions(userId);
  } catch (error) {
    throw new Error(`Failed to get sessions: ${error.message}`);
  }
}

// ========== ADMIN OPERATIONS ==========

/**
 * Get users list (with pagination)
 */
export async function getUsers(page = 1, pageSize = 20, filters = {}) {
  try {
    const conditions = {};
    
    if (filters.status) {
      conditions.status = filters.status;
    }
    
    if (filters.role) {
      conditions.role = filters.role;
    }

    const options = {
      orderBy: filters.orderBy || 'created_at',
      orderDirection: filters.orderDirection || 'desc'
    };

    return await userRepository.paginate(page, pageSize, conditions, options);
  } catch (error) {
    throw new Error(`Failed to get users list: ${error.message}`);
  }
}

/**
 * Search users
 */
export async function searchUsers(searchTerm, page = 1, pageSize = 20) {
  try {
    const offset = (page - 1) * pageSize;
    const users = await userRepository.searchUsers(searchTerm, {
      limit: pageSize,
      offset
    });

    const total = await userRepository.count({
      // Count with similar search conditions
    });

    return {
      data: users.map(user => sanitizeUserForResponse(user)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    throw new Error(`Search users failed: ${error.message}`);
  }
}

/**
 * Update user status (admin)
 */
export async function updateUserStatus(userId, status) {
  try {
    const updatedUser = await userRepository.updateUserStatus(userId, status);
    
    // If user is locked, delete all sessions
    if (status === 'suspended' || status === 'deleted') {
      await userRepository.deleteAllUserSessions(userId);
    }

    return sanitizeUserForResponse(updatedUser);
  } catch (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }
}

// ========== HEALTH CHECK ==========

/**
 * System health check
 */
export async function healthCheck() {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      service: 'auth-service'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      service: 'auth-service'
    };
  }
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      length: password.length < minLength ? `Password must be at least ${minLength} characters` : null,
      uppercase: !hasUpperCase ? 'Password must contain at least 1 uppercase letter' : null,
      lowercase: !hasLowerCase ? 'Password must contain at least 1 lowercase letter' : null,
      numbers: !hasNumbers ? 'Password must contain at least 1 number' : null,
      specialChar: !hasSpecialChar ? 'Password must contain at least 1 special character' : null
    }
  };
}

/**
 * Sanitize user input
 */
export function sanitizeUserInput(input) {
  return {
    ...input,
    email: input.email?.toLowerCase().trim(),
    username: input.username?.toLowerCase().trim(),
    first_name: input.first_name?.trim(),
    last_name: input.last_name?.trim(),
    phone: input.phone?.trim()
  };
} 