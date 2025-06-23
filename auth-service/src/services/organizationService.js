import * as organizationRepository from '../repositories/organizationRepository.js';

export async function findById(id) {
  return await organizationRepository.findById(id);
}

export async function findByUserId(userId) {
  return await organizationRepository.findByUserId(userId);
}

export async function create(organizationData) {
  return await organizationRepository.create(organizationData);
}

export async function update(id, updateData) {
  return await organizationRepository.update(id, updateData);
}

export async function deleteOrganization(id) {
  return await organizationRepository.deleteOrganization(id);
}

export async function list(filters = {}, pagination = {}) {
  return await organizationRepository.list(filters, pagination);
}

export async function count(filters = {}) {
  return await organizationRepository.count(filters);
} 