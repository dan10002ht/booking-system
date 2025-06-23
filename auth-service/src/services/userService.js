import * as userRepository from '../repositories/userRepository.js';
import * as organizationRepository from '../repositories/organizationRepository.js';

export async function findById(id) {
  return await userRepository.findById(id);
}

export async function findByEmail(email) {
  return await userRepository.findByEmail(email);
}

export async function findByOAuthProvider(provider, providerUserId) {
  return await userRepository.findByOAuthProvider(provider, providerUserId);
}

export async function create(userData) {
  return await userRepository.create(userData);
}

export async function update(id, updateData) {
  return await userRepository.update(id, updateData);
}

export async function deleteUser(id) {
  return await userRepository.deleteUser(id);
}

export async function findWithRoles(id) {
  return await userRepository.findWithRoles(id);
}

export async function findWithOrganization(id) {
  return await userRepository.findWithOrganization(id);
}

export async function list(filters = {}, pagination = {}) {
  return await userRepository.list(filters, pagination);
}

export async function count(filters = {}) {
  return await userRepository.count(filters);
} 