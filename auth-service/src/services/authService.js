import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import db from '../config/database.js';

// Email/Password Authentication
export async function register(userData, roleName = 'individual') {
  const transaction = await db.transaction();

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await createUser({
      ...userData,
      password_hash: hashedPassword,
      auth_type: 'email',
    });

    // Assign role
    const role = await findRoleByName(roleName);
    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    await db('user_roles').insert({
      user_id: user.id,
      role_id: role.id,
    });

    // Create organization if role is organization
    if (roleName === 'organization' && userData.organization) {
      await createOrganization({
        user_id: user.id,
        ...userData.organization,
      });
    }

    await transaction.commit();

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function login(email, password) {
  // Find user
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  if (user.auth_type === 'email') {
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
  } else {
    throw new Error('This account uses OAuth authentication');
  }

  // Update last login
  await updateUser(user.id, { last_login_at: new Date() });

  // Generate tokens
  const tokens = await generateTokens(user);

  // Return user and tokens
  const { password_hash, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    ...tokens,
  };
}

// OAuth Authentication
export async function oauthLogin(provider, providerData) {
  const transaction = await db.transaction();

  try {
    // Check if OAuth account exists
    let oauthAccount = await findOAuthAccountByProvider(provider, providerData.id);

    if (oauthAccount) {
      // Update OAuth account
      await updateOAuthAccount(oauthAccount.id, {
        access_token: providerData.access_token,
        refresh_token: providerData.refresh_token,
        expires_at: providerData.expires_at,
      });

      // Get user
      const user = await findUserById(oauthAccount.user_id);
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      // Update last login
      await updateUser(user.id, { last_login_at: new Date() });

      // Generate tokens
      const tokens = await generateTokens(user);

      await transaction.commit();

      const { password_hash, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        ...tokens,
      };
    } else {
      // Create new user and OAuth account
      const user = await createUser({
        email: providerData.email,
        first_name: providerData.first_name,
        last_name: providerData.last_name,
        profile_picture_url: providerData.picture,
        is_verified: true,
        email_verified_at: new Date(),
        auth_type: 'oauth',
      });

      // Create OAuth account
      await createOAuthAccount({
        user_id: user.id,
        provider,
        provider_user_id: providerData.id,
        access_token: providerData.access_token,
        refresh_token: providerData.refresh_token,
        expires_at: providerData.expires_at,
      });

      // Assign default role (individual)
      const role = await findRoleByName('individual');
      await db('user_roles').insert({
        user_id: user.id,
        role_id: role.id,
      });

      await transaction.commit();

      // Generate tokens
      const tokens = await generateTokens(user);

      const { password_hash, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        ...tokens,
      };
    }
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Token Management
export async function generateTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  // Store refresh token
  await db('refresh_tokens').insert({
    user_id: user.id,
    token_hash: refreshTokenHash,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return {
    accessToken,
    refreshToken,
  };
}

export async function refreshToken(refreshToken) {
  // Find refresh token
  const refreshTokens = await db('refresh_tokens')
    .where('is_revoked', false)
    .where('expires_at', '>', new Date());

  let validToken = null;
  for (const token of refreshTokens) {
    const isValid = await bcrypt.compare(refreshToken, token.token_hash);
    if (isValid) {
      validToken = token;
      break;
    }
  }

  if (!validToken) {
    throw new Error('Invalid refresh token');
  }

  // Get user
  const user = await findUserById(validToken.user_id);
  if (!user || !user.is_active) {
    throw new Error('User not found or inactive');
  }

  // Revoke old refresh token
  await db('refresh_tokens')
    .where('id', validToken.id)
    .update({ is_revoked: true });

  // Generate new tokens
  return await generateTokens(user);
}

export async function logout(refreshToken) {
  // Find and revoke refresh token
  const refreshTokens = await db('refresh_tokens')
    .where('is_revoked', false);

  for (const token of refreshTokens) {
    const isValid = await bcrypt.compare(refreshToken, token.token_hash);
    if (isValid) {
      await db('refresh_tokens')
        .where('id', token.id)
        .update({ is_revoked: true });
      break;
    }
  }
}

// Password Reset
export async function forgotPassword(email) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await bcrypt.hash(resetToken, 10);

  // Store reset token
  await db('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: resetTokenHash,
    expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  return resetToken;
}

export async function resetPassword(token, newPassword) {
  // Find reset token
  const resetTokens = await db('password_reset_tokens')
    .where('is_used', false)
    .where('expires_at', '>', new Date());

  let validToken = null;
  for (const resetToken of resetTokens) {
    const isValid = await bcrypt.compare(token, resetToken.token_hash);
    if (isValid) {
      validToken = resetToken;
      break;
    }
  }

  if (!validToken) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password
  await updateUser(validToken.user_id, {
    password_hash: hashedPassword,
  });

  // Mark token as used
  await db('password_reset_tokens')
    .where('id', validToken.id)
    .update({ is_used: true });
}

// Email Verification
export async function sendVerificationEmail(email) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.email_verified_at) {
    throw new Error('Email already verified');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = await bcrypt.hash(verificationToken, 10);

  // Store verification token
  await db('email_verification_tokens').insert({
    user_id: user.id,
    token_hash: verificationTokenHash,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  return verificationToken;
}

export async function verifyEmail(token) {
  // Find verification token
  const verificationTokens = await db('email_verification_tokens')
    .where('is_used', false)
    .where('expires_at', '>', new Date());

  let validToken = null;
  for (const verificationToken of verificationTokens) {
    const isValid = await bcrypt.compare(token, verificationToken.token_hash);
    if (isValid) {
      validToken = verificationToken;
      break;
    }
  }

  if (!validToken) {
    throw new Error('Invalid or expired verification token');
  }

  // Update user
  await updateUser(validToken.user_id, {
    is_verified: true,
    email_verified_at: new Date(),
  });

  // Mark token as used
  await db('email_verification_tokens')
    .where('id', validToken.id)
    .update({ is_used: true });
}

// Utility methods
export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await findUserById(decoded.userId);
    
    if (!user || !user.is_active) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function getUserPermissions(userId) {
  const user = await findUserWithRoles(userId);
  if (!user || !user.roles) {
    return [];
  }

  const permissions = [];
  for (const role of user.roles) {
    const roleWithPermissions = await findRoleWithPermissions(role.id);
    if (roleWithPermissions && roleWithPermissions.permissions) {
      permissions.push(...roleWithPermissions.permissions);
    }
  }

  return permissions;
}

// Database helper functions
async function findUserByEmail(email) {
  return await db('users').where({ email }).first();
}

async function findUserById(id) {
  return await db('users').where({ id }).first();
}

async function createUser(userData) {
  const [user] = await db('users').insert(userData).returning('*');
  return user;
}

async function updateUser(id, updateData) {
  const [user] = await db('users')
    .where({ id })
    .update({ ...updateData, updated_at: new Date() })
    .returning('*');
  return user;
}

async function findUserWithRoles(id) {
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

async function findRoleByName(name) {
  return await db('roles').where({ name }).first();
}

async function findRoleWithPermissions(id) {
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

async function createOrganization(organizationData) {
  const [organization] = await db('organizations').insert(organizationData).returning('*');
  return organization;
}

async function findOAuthAccountByProvider(provider, providerUserId) {
  return await db('oauth_accounts')
    .where({ provider, provider_user_id: providerUserId })
    .first();
}

async function createOAuthAccount(oauthData) {
  const [oauthAccount] = await db('oauth_accounts').insert(oauthData).returning('*');
  return oauthAccount;
}

async function updateOAuthAccount(id, updateData) {
  const [oauthAccount] = await db('oauth_accounts')
    .where({ id })
    .update({ ...updateData, updated_at: new Date() })
    .returning('*');
  return oauthAccount;
} 