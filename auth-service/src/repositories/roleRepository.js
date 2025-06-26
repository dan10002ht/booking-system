import BaseRepository from './baseRepository.js';

/**
 * Role Repository với Master-Slave Pattern
 * Kế thừa từ BaseRepository để tự động route read/write operations
 */
class RoleRepository extends BaseRepository {
  constructor() {
    super('roles');
  }

  // ========== ROLE-SPECIFIC READ OPERATIONS ==========

  /**
   * Tìm role theo name (read từ slave)
   */
  async findByName(name) {
    return await this.findOne({ name });
  }

  /**
   * Tìm role với permissions (read từ slave)
   */
  async findWithPermissions(id) {
    const role = await this.getSlaveDb()
      .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
      .leftJoin('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('roles.id', id)
      .select(
        'roles.*',
        this.getSlaveDb().raw(
          "json_agg(json_build_object('id', permissions.id, 'name', permissions.name, 'resource', permissions.resource, 'action', permissions.action)) as permissions"
        )
      )
      .groupBy('roles.id')
      .first();

    if (role && role.permissions) {
      role.permissions = role.permissions.filter((permission) => permission.id !== null);
    }

    return role;
  }

  /**
   * Lấy tất cả roles (read từ slave)
   */
  async getAllRoles() {
    return await this.findAll({ orderBy: 'name' });
  }

  /**
   * Lấy user roles (read từ slave)
   */
  async getUserRoles(userId) {
    return await this.getSlaveDb()
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', userId)
      .select('roles.*');
  }

  // ========== ROLE-SPECIFIC WRITE OPERATIONS ==========

  /**
   * Tạo role mới (write vào master)
   */
  async createRole(roleData) {
    const normalizedData = {
      ...roleData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return await this.create(normalizedData);
  }

  /**
   * Cập nhật role (write vào master)
   */
  async updateRole(id, updateData) {
    const normalizedData = {
      ...updateData,
      updated_at: new Date(),
    };

    return await this.updateById(id, normalizedData);
  }

  /**
   * Xóa role (write vào master)
   */
  async deleteRole(id) {
    return await this.deleteById(id);
  }

  /**
   * Gán role cho user (write vào master)
   */
  async assignToUser(userId, roleId) {
    return await this.getMasterDb()('user_roles').insert({
      user_id: userId,
      role_id: roleId,
      created_at: new Date(),
    });
  }

  /**
   * Xóa role khỏi user (write vào master)
   */
  async removeFromUser(userId, roleId) {
    return await this.getMasterDb()('user_roles').where({ user_id: userId, role_id: roleId }).del();
  }
}

export default RoleRepository;
