import BaseRepository from './baseRepository.js';

/**
 * Token Repository với Master-Slave Pattern
 * Quản lý tất cả các loại tokens: refresh, password reset, email verification
 */
class TokenRepository extends BaseRepository {
  constructor() {
    super('tokens'); // Base table, nhưng sẽ sử dụng các bảng cụ thể
  }

  // ========== REFRESH TOKENS ==========

  /**
   * Tạo refresh token (write vào master)
   */
  async createRefreshToken(tokenData) {
    const normalizedData = {
      ...tokenData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [token] = await this.getMasterDb()('refresh_tokens')
      .insert(normalizedData)
      .returning('*');

    return token;
  }

  /**
   * Tìm refresh token theo hash (read từ slave)
   */
  async findRefreshTokenByHash(tokenHash) {
    return await this.getSlaveDb()('refresh_tokens').where({ token_hash: tokenHash }).first();
  }

  /**
   * Tìm valid refresh tokens của user (read từ slave)
   */
  async findValidRefreshTokens(userId) {
    return await this.getSlaveDb()('refresh_tokens')
      .where({ user_id: userId, is_revoked: false })
      .where('expires_at', '>', new Date());
  }

  /**
   * Revoke refresh token (write vào master)
   */
  async revokeRefreshToken(id) {
    return await this.getMasterDb()('refresh_tokens')
      .where({ id })
      .update({ is_revoked: true, updated_at: new Date() });
  }

  /**
   * Revoke tất cả tokens của user (write vào master)
   */
  async revokeAllUserTokens(userId) {
    return await this.getMasterDb()('refresh_tokens')
      .where({ user_id: userId })
      .update({ is_revoked: true, updated_at: new Date() });
  }

  /**
   * Xóa expired tokens (write vào master)
   */
  async deleteExpiredTokens() {
    return await this.getMasterDb()('refresh_tokens').where('expires_at', '<', new Date()).del();
  }

  // ========== PASSWORD RESET TOKENS ==========

  /**
   * Tạo password reset token (write vào master)
   */
  async createPasswordResetToken(tokenData) {
    const normalizedData = {
      ...tokenData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [token] = await this.getMasterDb()('password_reset_tokens')
      .insert(normalizedData)
      .returning('*');

    return token;
  }

  /**
   * Tìm valid password reset tokens (read từ slave)
   */
  async findValidPasswordResetTokens() {
    return await this.getSlaveDb()('password_reset_tokens')
      .where('is_used', false)
      .where('expires_at', '>', new Date());
  }

  /**
   * Mark password reset token as used (write vào master)
   */
  async markPasswordResetTokenAsUsed(id) {
    return await this.getMasterDb()('password_reset_tokens')
      .where({ id })
      .update({ is_used: true, updated_at: new Date() });
  }

  /**
   * Xóa expired password reset tokens (write vào master)
   */
  async deleteExpiredPasswordResetTokens() {
    return await this.getMasterDb()('password_reset_tokens')
      .where('expires_at', '<', new Date())
      .del();
  }

  // ========== EMAIL VERIFICATION TOKENS ==========

  /**
   * Tạo email verification token (write vào master)
   */
  async createEmailVerificationToken(tokenData) {
    const normalizedData = {
      ...tokenData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [token] = await this.getMasterDb()('email_verification_tokens')
      .insert(normalizedData)
      .returning('*');

    return token;
  }

  /**
   * Tìm valid email verification tokens (read từ slave)
   */
  async findValidEmailVerificationTokens() {
    return await this.getSlaveDb()('email_verification_tokens')
      .where('is_used', false)
      .where('expires_at', '>', new Date());
  }

  /**
   * Mark email verification token as used (write vào master)
   */
  async markEmailVerificationTokenAsUsed(id) {
    return await this.getMasterDb()('email_verification_tokens')
      .where({ id })
      .update({ is_used: true, updated_at: new Date() });
  }

  /**
   * Xóa expired email verification tokens (write vào master)
   */
  async deleteExpiredEmailVerificationTokens() {
    return await this.getMasterDb()('email_verification_tokens')
      .where('expires_at', '<', new Date())
      .del();
  }

  // ========== GENERAL TOKEN OPERATIONS ==========

  /**
   * Cleanup tất cả expired tokens (write vào master)
   */
  async cleanupAllExpiredTokens() {
    const results = await Promise.all([
      this.deleteExpiredTokens(),
      this.deleteExpiredPasswordResetTokens(),
      this.deleteExpiredEmailVerificationTokens(),
    ]);

    return {
      refreshTokens: results[0],
      passwordResetTokens: results[1],
      emailVerificationTokens: results[2],
    };
  }
}

export default TokenRepository;
