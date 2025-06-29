import BaseRepository from './baseRepository.js';

/**
 * RefreshToken Repository với Master-Slave Pattern
 * Quản lý refresh tokens
 */
class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super('refresh_tokens');
  }

  // ========== REFRESH TOKEN OPERATIONS ==========

  /**
   * Tạo refresh token (write vào master)
   */
  async createRefreshToken(tokenData) {
    const normalizedData = {
      ...tokenData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const token = await this.create(normalizedData);
    return token;
  }

  /**
   * Tìm refresh token theo hash (read từ slave)
   */
  async findByHash(tokenHash) {
    return await this.findOne({ token_hash: tokenHash });
  }

  /**
   * Tìm valid refresh tokens của user (read từ slave)
   */
  async findValidByUserId(userId) {
    return await this.getSlaveDb()
      .where({ user_id: userId, is_revoked: false })
      .where('expires_at', '>', new Date());
  }

  /**
   * Revoke refresh token (write vào master)
   */
  async revokeById(id) {
    return await this.updateById(id, {
      is_revoked: true,
      updated_at: new Date(),
    });
  }

  /**
   * Revoke tất cả tokens của user (write vào master)
   */
  async revokeAllByUserId(userId) {
    return await this.getMasterDb()
      .where({ user_id: userId })
      .update({ is_revoked: true, updated_at: new Date() });
  }

  /**
   * Xóa expired tokens (write vào master)
   */
  async deleteExpired() {
    return await this.getMasterDb().where('expires_at', '<', new Date()).del();
  }

  /**
   * Tìm refresh token theo ID (read từ slave)
   */
  async findById(id) {
    return await this.findOne({ id });
  }
}

export default RefreshTokenRepository;
