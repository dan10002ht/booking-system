import { getUserRepository } from '../../repositories/repositoryFactory.js';
import { sanitizeUserInput, sanitizeUserForResponse } from '../../utils/sanitizers.js';
import { validateEmail, validatePassword } from '../../utils/validations.js';

// Get user repository instance from factory
const userRepository = getUserRepository();

// ========== USER PROFILE MANAGEMENT ==========

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

// ========== USER SEARCH & LISTING ==========

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
      orderDirection: filters.orderDirection || 'desc',
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
      offset,
    });

    const total = await userRepository.count({
      // Count with similar search conditions
    });

    return {
      data: users.map((user) => sanitizeUserForResponse(user)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Search users failed: ${error.message}`);
  }
}

// ========== RE-EXPORT UTILITY FUNCTIONS ==========

export { validateEmail, validatePassword, sanitizeUserInput };
