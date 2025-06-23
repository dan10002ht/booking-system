import db from '../config/database.js';

export async function findById(id) {
  return await db('users').where({ id }).first();
}

export async function findByEmail(email) {
  return await db('users').where({ email }).first();
}

export async function findByOAuthProvider(provider, providerUserId) {
  return await db('users')
    .join('oauth_accounts', 'users.id', 'oauth_accounts.user_id')
    .where({
      'oauth_accounts.provider': provider,
      'oauth_accounts.provider_user_id': providerUserId,
    })
    .select('users.*')
    .first();
}

export async function create(userData) {
  const [user] = await db('users').insert(userData).returning('*');
  return user;
}

export async function update(id, updateData) {
  const [user] = await db('users')
    .where({ id })
    .update({ ...updateData, updated_at: new Date() })
    .returning('*');
  return user;
}

export async function deleteUser(id) {
  return await db('users').where({ id }).del();
}

export async function findWithRoles(id) {
  const user = await db('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.id', id)
    .select(
      'users.*',
      db.raw('json_agg(json_build_object(\'id\', roles.id, \'name\', roles.name, \'description\', roles.description)) as roles')
    )
    .groupBy('users.id')
    .first();

  if (user && user.roles) {
    user.roles = user.roles.filter(role => role.id !== null);
  }

  return user;
}

export async function findWithOrganization(id) {
  const user = await db('users')
    .leftJoin('organizations', 'users.id', 'organizations.user_id')
    .where('users.id', id)
    .select('users.*', 'organizations.*')
    .first();

  return user;
}

export async function list(filters = {}, pagination = {}) {
  let query = db('users');

  // Apply filters
  if (filters.is_active !== undefined) {
    query = query.where('is_active', filters.is_active);
  }

  if (filters.is_verified !== undefined) {
    query = query.where('is_verified', filters.is_verified);
  }

  if (filters.auth_type) {
    query = query.where('auth_type', filters.auth_type);
  }

  if (filters.search) {
    query = query.where(function() {
      this.where('email', 'ilike', `%${filters.search}%`)
        .orWhere('first_name', 'ilike', `%${filters.search}%`)
        .orWhere('last_name', 'ilike', `%${filters.search}%`);
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
  let query = db('users');

  // Apply filters
  if (filters.is_active !== undefined) {
    query = query.where('is_active', filters.is_active);
  }

  if (filters.is_verified !== undefined) {
    query = query.where('is_verified', filters.is_verified);
  }

  if (filters.auth_type) {
    query = query.where('auth_type', filters.auth_type);
  }

  if (filters.search) {
    query = query.where(function() {
      this.where('email', 'ilike', `%${filters.search}%`)
        .orWhere('first_name', 'ilike', `%${filters.search}%`)
        .orWhere('last_name', 'ilike', `%${filters.search}%`);
    });
  }

  const result = await query.count('* as total');
  return parseInt(result[0].total);
} 