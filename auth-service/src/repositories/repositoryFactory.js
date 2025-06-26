import UserRepository from './userRepository.js';
import RoleRepository from './roleRepository.js';
import PermissionRepository from './permissionRepository.js';
import TokenRepository from './tokenRepository.js';
import OAuthAccountRepository from './oauthAccountRepository.js';
import OrganizationRepository from './organizationRepository.js';

// Singleton instances for master-slave pattern
let userRepositoryInstance = null;
let roleRepositoryInstance = null;
let permissionRepositoryInstance = null;
let tokenRepositoryInstance = null;
let oauthAccountRepositoryInstance = null;
let organizationRepositoryInstance = null;

/**
 * Get UserRepository singleton instance
 */
export function getUserRepository() {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository();
  }
  return userRepositoryInstance;
}

/**
 * Get RoleRepository singleton instance
 */
export function getRoleRepository() {
  if (!roleRepositoryInstance) {
    roleRepositoryInstance = new RoleRepository();
  }
  return roleRepositoryInstance;
}

/**
 * Get PermissionRepository singleton instance
 */
export function getPermissionRepository() {
  if (!permissionRepositoryInstance) {
    permissionRepositoryInstance = new PermissionRepository();
  }
  return permissionRepositoryInstance;
}

/**
 * Get TokenRepository singleton instance
 */
export function getTokenRepository() {
  if (!tokenRepositoryInstance) {
    tokenRepositoryInstance = new TokenRepository();
  }
  return tokenRepositoryInstance;
}

/**
 * Get OAuthAccountRepository singleton instance
 */
export function getOAuthAccountRepository() {
  if (!oauthAccountRepositoryInstance) {
    oauthAccountRepositoryInstance = new OAuthAccountRepository();
  }
  return oauthAccountRepositoryInstance;
}

/**
 * Get OrganizationRepository singleton instance
 */
export function getOrganizationRepository() {
  if (!organizationRepositoryInstance) {
    organizationRepositoryInstance = new OrganizationRepository();
  }
  return organizationRepositoryInstance;
}

/**
 * Reset all repository instances (for testing)
 */
export function resetRepositories() {
  userRepositoryInstance = null;
  roleRepositoryInstance = null;
  permissionRepositoryInstance = null;
  tokenRepositoryInstance = null;
  oauthAccountRepositoryInstance = null;
  organizationRepositoryInstance = null;
}

/**
 * Get all repository instances (for bulk operations)
 */
export function getAllRepositories() {
  return {
    user: getUserRepository(),
    role: getRoleRepository(),
    permission: getPermissionRepository(),
    token: getTokenRepository(),
    oauthAccount: getOAuthAccountRepository(),
    organization: getOrganizationRepository(),
  };
}
