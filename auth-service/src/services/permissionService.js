import UserRepository from '../repositories/userRepository.js';
import RoleRepository from '../repositories/roleRepository.js';
import PermissionRepository from '../repositories/permissionRepository.js';
import { sanitizeUserForResponse } from '../utils/sanitizers.js';

// Initialize repositories
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const permissionRepository = new PermissionRepository();

// ========== USER PERMISSIONS ==========

/**
 * Get user permissions
 */
export async function getUserPermissions(userId) {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user permissions from database
    const permissions = await permissionRepository.getUserPermissions(userId);

    // Format permissions for response
    const formattedPermissions = permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    }));

    return {
      user: sanitizeUserForResponse(user),
      permissions: formattedPermissions,
    };
  } catch (error) {
    throw new Error(`Failed to get user permissions: ${error.message}`);
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(userId, permissionName) {
  try {
    const permissions = await permissionRepository.getUserPermissions(userId);
    return permissions.some((permission) => permission.name === permissionName);
  } catch (error) {
    throw new Error(`Failed to check permission: ${error.message}`);
  }
}

/**
 * Check if user has permission for resource and action
 */
export async function hasResourcePermission(userId, resource, action) {
  try {
    const permissions = await permissionRepository.getUserPermissions(userId);
    return permissions.some(
      (permission) => permission.resource === resource && permission.action === action
    );
  } catch (error) {
    throw new Error(`Failed to check resource permission: ${error.message}`);
  }
}

// ========== ROLE MANAGEMENT ==========

/**
 * Get user roles
 */
export async function getUserRoles(userId) {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const roles = await roleRepository.findByUserId(userId);
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
    }));
  } catch (error) {
    throw new Error(`Failed to get user roles: ${error.message}`);
  }
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(userId, roleId) {
  try {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if role exists
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if user already has this role
    const existingRoles = await roleRepository.findByUserId(userId);
    const hasRole = existingRoles.some((r) => r.id === roleId);
    if (hasRole) {
      throw new Error('User already has this role');
    }

    // Assign role
    await roleRepository.assignToUser(userId, roleId);

    return {
      message: 'Role assigned successfully',
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
    };
  } catch (error) {
    throw new Error(`Failed to assign role: ${error.message}`);
  }
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(userId, roleId) {
  try {
    // Check if user has this role
    const existingRoles = await roleRepository.findByUserId(userId);
    const hasRole = existingRoles.some((r) => r.id === roleId);
    if (!hasRole) {
      throw new Error('User does not have this role');
    }

    // Remove role
    await roleRepository.removeFromUser(userId, roleId);

    return {
      message: 'Role removed successfully',
    };
  } catch (error) {
    throw new Error(`Failed to remove role: ${error.message}`);
  }
}

// ========== PERMISSION MANAGEMENT ==========

/**
 * Get all permissions
 */
export async function getAllPermissions() {
  try {
    const permissions = await permissionRepository.findAll();
    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    }));
  } catch (error) {
    throw new Error(`Failed to get permissions: ${error.message}`);
  }
}

/**
 * Get permissions by resource
 */
export async function getPermissionsByResource(resource) {
  try {
    const permissions = await permissionRepository.findByResource(resource);
    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    }));
  } catch (error) {
    throw new Error(`Failed to get permissions by resource: ${error.message}`);
  }
}

/**
 * Create new permission
 */
export async function createPermission(permissionData) {
  try {
    const permission = await permissionRepository.create(permissionData);
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    };
  } catch (error) {
    throw new Error(`Failed to create permission: ${error.message}`);
  }
}

/**
 * Assign permission to role
 */
export async function assignPermissionToRole(roleId, permissionId) {
  try {
    await permissionRepository.assignToRole(roleId, permissionId);
    return {
      message: 'Permission assigned to role successfully',
    };
  } catch (error) {
    throw new Error(`Failed to assign permission to role: ${error.message}`);
  }
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(roleId, permissionId) {
  try {
    await permissionRepository.removeFromRole(roleId, permissionId);
    return {
      message: 'Permission removed from role successfully',
    };
  } catch (error) {
    throw new Error(`Failed to remove permission from role: ${error.message}`);
  }
}
