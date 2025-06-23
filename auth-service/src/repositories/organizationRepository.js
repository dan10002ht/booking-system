import db from '../config/database.js';

export async function findById(id) {
  return await db('organizations').where({ id }).first();
}

export async function findByUserId(userId) {
  return await db('organizations').where({ user_id: userId }).first();
}

export async function create(organizationData) {
  const [organization] = await db('organizations').insert(organizationData).returning('*');
  return organization;
}

export async function update(id, updateData) {
  const [organization] = await db('organizations')
    .where({ id })
    .update({ ...updateData, updated_at: new Date() })
    .returning('*');
  return organization;
}

export async function deleteOrganization(id) {
  return await db('organizations').where({ id }).del();
}

export async function list(filters = {}, pagination = {}) {
  let query = db('organizations');

  // Apply filters
  if (filters.is_verified !== undefined) {
    query = query.where('is_verified', filters.is_verified);
  }

  if (filters.search) {
    query = query.where(function() {
      this.where('name', 'ilike', `%${filters.search}%`)
        .orWhere('description', 'ilike', `%${filters.search}%`);
    });
  }

  // Apply pagination
  if (pagination.limit) {
    query = query.limit(pagination.limit);
  }

  if (pagination.offset) {
    query = query.offset(pagination.offset);
  }

  // Apply sorting
  const sortBy = pagination.sortBy || 'created_at';
  const sortOrder = pagination.sortOrder || 'desc';
  query = query.orderBy(sortBy, sortOrder);

  return await query;
}

export async function count(filters = {}) {
  let query = db('organizations');

  // Apply filters
  if (filters.is_verified !== undefined) {
    query = query.where('is_verified', filters.is_verified);
  }

  if (filters.search) {
    query = query.where(function() {
      this.where('name', 'ilike', `%${filters.search}%`)
        .orWhere('description', 'ilike', `%${filters.search}%`);
    });
  }

  const result = await query.count('* as total');
  return parseInt(result[0].total);
} 