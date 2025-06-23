import db from '../config/database.js';

export async function findById(id) {
  return await db('roles').where({ id }).first();
}

export async function findByName(name) {
  return await db('roles').where({ name }).first();
}

export async function create(roleData) {
  const [role] = await db('roles').insert(roleData).returning('*');
  return role;
}

export async function update(id, updateData) {
  const [role] = await db('roles')
    .where({ id })
    .update({ ...updateData, updated_at: new Date() })
    .returning('*');
  return role;
}

export async function deleteRole(id) {
  return await db('roles').where({ id }).del();
}

export async function findWithPermissions(id) {
  const role = await db('roles')
    .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
    .leftJoin('permissions', 'role_permissions.permission_id', 'permissions.id')
    .where('roles.id', id)
    .select(
      'roles.*',
      db.raw('json_agg(json_build_object(\'id\', permissions.id, \'name\', permissions.name, \'resource\', permissions.resource, \'action\', permissions.action)) as permissions')
    )
    .groupBy('roles.id')
    .first();

  if (role && role.permissions) {
    role.permissions = role.permissions.filter(permission => permission.id !== null);
  }

  return role;
}

export async function list() {
  return await db('roles').orderBy('name');
}

export async function assignToUser(userId, roleId) {
  return await db('user_roles').insert({
    user_id: userId,
    role_id: roleId,
  });
}

export async function removeFromUser(userId, roleId) {
  return await db('user_roles')
    .where({ user_id: userId, role_id: roleId })
    .del();
}

export async function getUserRoles(userId) {
  return await db('user_roles')
    .join('roles', 'user_roles.role_id', 'roles.id')
    .where('user_roles.user_id', userId)
    .select('roles.*');
} 