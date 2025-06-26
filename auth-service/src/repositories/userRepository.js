import db from '../config/database.js';
import BaseRepository from './baseRepository.js';
import bcrypt from 'bcrypt';

/**
 * User Repository với Master-Slave Pattern
 * Kế thừa từ BaseRepository để tự động route read/write operations
 */
class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  // ========== USER-SPECIFIC READ OPERATIONS ==========

  /**
   * Tìm user theo email (read từ slave)
   */
  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Tìm user theo username (read từ slave)
   */
  async findByUsername(username) {
    return await this.findOne({ username: username.toLowerCase() });
  }

  /**
   * Tìm user theo phone (read từ slave)
   */
  async findByPhone(phone) {
    return await this.findOne({ phone });
  }

  /**
   * Tìm users theo role (read từ slave)
   */
  async findByRole(role, options = {}) {
    return await this.findMany({ role }, options);
  }

  /**
   * Tìm users đang active (read từ slave)
   */
  async findActiveUsers(options = {}) {
    return await this.findMany({ status: 'active' }, options);
  }

  /**
   * Tìm users theo status (read từ slave)
   */
  async findByStatus(status, options = {}) {
    return await this.findMany({ status }, options);
  }

  /**
   * Search users theo nhiều tiêu chí (read từ slave)
   */
  async searchUsers(searchTerm, options = {}) {
    const { limit = 20, offset = 0, orderBy = 'created_at', orderDirection = 'desc' } = options;

    return await this.getSlaveDb()
      .select('*')
      .where(function () {
        this.where('email', 'ilike', `%${searchTerm}%`)
          .orWhere('username', 'ilike', `%${searchTerm}%`)
          .orWhere('first_name', 'ilike', `%${searchTerm}%`)
          .orWhere('last_name', 'ilike', `%${searchTerm}%`)
          .orWhere('phone', 'ilike', `%${searchTerm}%`);
      })
      .orderBy(orderBy, orderDirection)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Lấy user profile với thông tin chi tiết (read từ slave)
   */
  async getUserProfile(userId) {
    return await this.getSlaveDb()
      .select(
        'users.*',
        'user_profiles.bio',
        'user_profiles.avatar_url',
        'user_profiles.date_of_birth',
        'user_profiles.gender',
        'user_profiles.address',
        'user_profiles.preferences'
      )
      .leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
      .where('users.id', userId)
      .first();
  }

  /**
   * Lấy user statistics (read từ slave)
   */
  async getUserStats(userId) {
    const [user, totalBookings, totalSpent] = await Promise.all([
      this.findById(userId),
      this.getSlaveDb()('bookings').where('user_id', userId).count('* as total').first(),
      this.getSlaveDb()('payments')
        .where('user_id', userId)
        .where('status', 'completed')
        .sum('amount as total')
        .first(),
    ]);

    return {
      user,
      stats: {
        totalBookings: parseInt(totalBookings?.total || 0),
        totalSpent: parseFloat(totalSpent?.total || 0),
      },
    };
  }

  // ========== USER-SPECIFIC WRITE OPERATIONS ==========

  /**
   * Tạo user mới với password được hash (write vào master)
   */
  async createUser(userData) {
    const { password, ...otherData } = userData;

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Chuẩn hóa email và username
    const normalizedData = {
      ...otherData,
      email: otherData.email?.toLowerCase(),
      username: otherData.username?.toLowerCase(),
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return await this.create(normalizedData);
  }

  /**
   * Cập nhật user (write vào master)
   */
  async updateUser(userId, updateData) {
    const normalizedData = {
      ...updateData,
      email: updateData.email?.toLowerCase(),
      username: updateData.username?.toLowerCase(),
      updated_at: new Date(),
    };

    return await this.updateById(userId, normalizedData);
  }

  /**
   * Cập nhật password (write vào master)
   */
  async updatePassword(userId, newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    return await this.updateById(userId, {
      password: hashedPassword,
      updated_at: new Date(),
    });
  }

  /**
   * Cập nhật user status (write vào master)
   */
  async updateUserStatus(userId, status) {
    return await this.updateById(userId, {
      status,
      updated_at: new Date(),
    });
  }

  /**
   * Cập nhật last login (write vào master)
   */
  async updateLastLogin(userId) {
    return await this.updateById(userId, {
      last_login_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Soft delete user (write vào master)
   */
  async softDeleteUser(userId) {
    return await this.updateById(userId, {
      status: 'deleted',
      deleted_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Hard delete user (write vào master)
   */
  async hardDeleteUser(userId) {
    // Xóa các related records trước
    await this.transaction(async (trx) => {
      await trx('user_sessions').where('user_id', userId).del();
      await trx('user_profiles').where('user_id', userId).del();
      await trx('user_tokens').where('user_id', userId).del();
      await trx('users').where('id', userId).del();
    });
  }

  // ========== AUTHENTICATION OPERATIONS ==========

  /**
   * Verify password
   */
  async verifyPassword(userId, password) {
    const user = await this.findById(userId);
    if (!user) {
      return false;
    }

    return await bcrypt.compare(password, user.password);
  }

  /**
   * Verify email và password cho login
   */
  async verifyCredentials(email, password) {
    const user = await this.findByEmail(email);
    if (!user || user.status !== 'active') {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  /**
   * Tạo user session (write vào master)
   */
  async createUserSession(userId, sessionData) {
    return await this.getMasterDb()('user_sessions')
      .insert({
        ...sessionData,
        user_id: userId,
        created_at: new Date(),
      })
      .returning('*');
  }

  /**
   * Lấy user sessions (read từ slave)
   */
  async getUserSessions(userId) {
    return await this.getSlaveDb()('user_sessions')
      .where('user_id', userId)
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc');
  }

  /**
   * Xóa user session (write vào master)
   */
  async deleteUserSession(sessionId) {
    return await this.getMasterDb()('user_sessions').where('id', sessionId).del();
  }

  /**
   * Xóa tất cả sessions của user (write vào master)
   */
  async deleteAllUserSessions(userId) {
    return await this.getMasterDb()('user_sessions').where('user_id', userId).del();
  }

  // ========== BULK OPERATIONS ==========

  /**
   * Bulk update users (write vào master)
   */
  async bulkUpdateUsers(userIds, updateData) {
    return await this.getMasterDb()
      .whereIn('id', userIds)
      .update({
        ...updateData,
        updated_at: new Date(),
      })
      .returning('*');
  }

  /**
   * Bulk delete users (write vào master)
   */
  async bulkDeleteUsers(userIds) {
    return await this.transaction(async (trx) => {
      await trx('user_sessions').whereIn('user_id', userIds).del();
      await trx('user_profiles').whereIn('user_id', userIds).del();
      await trx('user_tokens').whereIn('user_id', userIds).del();

      return await trx('users').whereIn('id', userIds).del().returning('*');
    });
  }
}

export default UserRepository;

export async function findById(id) {
  return await db('users').where({ id }).first();
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
      db.raw(
        "json_agg(json_build_object('id', roles.id, 'name', roles.name, 'description', roles.description)) as roles"
      )
    )
    .groupBy('users.id')
    .first();

  if (user && user.roles) {
    user.roles = user.roles.filter((role) => role.id !== null);
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
    query = query.where(function () {
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
    query = query.where(function () {
      this.where('email', 'ilike', `%${filters.search}%`)
        .orWhere('first_name', 'ilike', `%${filters.search}%`)
        .orWhere('last_name', 'ilike', `%${filters.search}%`);
    });
  }

  const result = await query.count('* as total');
  return parseInt(result[0].total);
}
