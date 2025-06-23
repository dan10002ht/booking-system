import db from '../config/database.js';

// Refresh Tokens
export async function createRefreshToken(tokenData) {
  const [token] = await db('refresh_tokens').insert(tokenData).returning('*');
  return token;
}

export async function findRefreshTokenByHash(tokenHash) {
  return await db('refresh_tokens')
    .where({ token_hash: tokenHash })
    .first();
}

export async function findValidRefreshTokens(userId) {
  return await db('refresh_tokens')
    .where({ user_id: userId, is_revoked: false })
    .where('expires_at', '>', new Date());
}

export async function revokeRefreshToken(id) {
  return await db('refresh_tokens')
    .where({ id })
    .update({ is_revoked: true, updated_at: new Date() });
}

export async function revokeAllUserTokens(userId) {
  return await db('refresh_tokens')
    .where({ user_id: userId })
    .update({ is_revoked: true, updated_at: new Date() });
}

export async function deleteExpiredTokens() {
  return await db('refresh_tokens')
    .where('expires_at', '<', new Date())
    .del();
}

// Password Reset Tokens
export async function createPasswordResetToken(tokenData) {
  const [token] = await db('password_reset_tokens').insert(tokenData).returning('*');
  return token;
}

export async function findValidPasswordResetTokens() {
  return await db('password_reset_tokens')
    .where('is_used', false)
    .where('expires_at', '>', new Date());
}

export async function markPasswordResetTokenAsUsed(id) {
  return await db('password_reset_tokens')
    .where({ id })
    .update({ is_used: true });
}

export async function deleteExpiredPasswordResetTokens() {
  return await db('password_reset_tokens')
    .where('expires_at', '<', new Date())
    .del();
}

// Email Verification Tokens
export async function createEmailVerificationToken(tokenData) {
  const [token] = await db('email_verification_tokens').insert(tokenData).returning('*');
  return token;
}

export async function findValidEmailVerificationTokens() {
  return await db('email_verification_tokens')
    .where('is_used', false)
    .where('expires_at', '>', new Date());
}

export async function markEmailVerificationTokenAsUsed(id) {
  return await db('email_verification_tokens')
    .where({ id })
    .update({ is_used: true });
}

export async function deleteExpiredEmailVerificationTokens() {
  return await db('email_verification_tokens')
    .where('expires_at', '<', new Date())
    .del();
} 