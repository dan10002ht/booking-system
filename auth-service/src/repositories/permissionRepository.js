import db from '../config/database.js';

export async function findById(id) {
  return await db('permissions').where({ id }).first();
}

export async function findByName(name) {
  return await db('permissions').where({ name }).first();
}

export async function findByResourceAndAction(resource, action) {
  return await db('permissions')
    .where({ resource, action })
    .first();
}

export async function create(permissionData) {
  const [permission] = await db('permissions').insert(permissionData).returning('*');
  return permission;
}

export async function update(id, updateData) {
  const [permission] = await db('permissions')
    .where({ id })
    .update(updateData)
    .returning('*');
  return permission;
}

export async function deletePermission(id) {
  return await db('permissions').where({ id }).del();
}

export async function list() {
  return await db('permissions').orderBy('resource', 'action');
}

export async function findByResource(resource) {
  return await db('permissions')
    .where({ resource })
    .orderBy('action');
}

export async function assignToRole(roleId, permissionId) {
  return await db('role_permissions').insert({
    role_id: roleId,
    permission_id: permissionId,
  });
}

export async function removeFromRole(roleId, permissionId) {
  return await db('role_permissions')
    .where({ role_id: roleId, permission_id: permissionId })
    .del();
}

export async function getRolePermissions(roleId) {
  return await db('role_permissions')
    .join('permissions', 'role_permissions.permission_id', 'permissions.id')
    .where('role_permissions.role_id', roleId)
    .select('permissions.*');
}

export async function getUserPermissions(userId) {
  return await db('user_roles')
    .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
    .join('permissions', 'role_permissions.permission_id', 'permissions.id')
    .where('user_roles.user_id', userId)
    .select('permissions.*')
    .distinct();
} 