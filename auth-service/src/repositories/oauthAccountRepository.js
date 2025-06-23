import db from '../config/database.js';

export async function findById(id) {
  return await db('oauth_accounts').where({ id }).first();
}

export async function findByProvider(provider, providerUserId) {
  return await db('oauth_accounts')
    .where({ provider, provider_user_id: providerUserId })
    .first();
}

export async function findByUserId(userId) {
  return await db('oauth_accounts').where({ user_id: userId });
}

export async function findByUserIdAndProvider(userId, provider) {
  return await db('oauth_accounts')
    .where({ user_id: userId, provider })
    .first();
}

export async function create(oauthData) {
  const [oauthAccount] = await db('oauth_accounts').insert(oauthData).returning('*');
  return oauthAccount;
}

export async function update(id, updateData) {
  const [oauthAccount] = await db('oauth_accounts')
    .where({ id })
    .update({ ...updateData, updated_at: new Date() })
    .returning('*');
  return oauthAccount;
}

export async function deleteOAuthAccount(id) {
  return await db('oauth_accounts').where({ id }).del();
}

export async function deleteByUserId(userId) {
  return await db('oauth_accounts').where({ user_id: userId }).del();
} 