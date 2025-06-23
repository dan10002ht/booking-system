import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import * as userRepository from '../repositories/userRepository.js';
import * as organizationRepository from '../repositories/organizationRepository.js';
import * as oauthAccountRepository from '../repositories/oauthAccountRepository.js';
import * as roleRepository from '../repositories/roleRepository.js';
import * as permissionRepository from '../repositories/permissionRepository.js';
import * as tokenRepository from '../repositories/tokenRepository.js';
import db from '../config/database.js';

// Email/Password Authentication
export async function register(userData, roleName = 'individual') {
  const transaction = await db.transaction();

  try {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await userRepository.create({
      ...userData,
      password_hash: hashedPassword,
      auth_type: 'email',
    });

    // Assign role
    const role = await roleRepository.findByName(roleName);
    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    await roleRepository.assignToUser(user.id, role.id);

    // Create organization if role is organization
    if (roleName === 'organization' && userData.organization) {
      await organizationRepository.create({
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
  const user = await userRepository.findByEmail(email);
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
  await userRepository.update(user.id, { last_login_at: new Date() });

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
    let oauthAccount = await oauthAccountRepository.findByProvider(provider, providerData.id);

    if (oauthAccount) {
      // Update OAuth account
      await oauthAccountRepository.update(oauthAccount.id, {
        access_token: providerData.access_token,
        refresh_token: providerData.refresh_token,
        expires_at: providerData.expires_at,
      });

      // Get user
      const user = await userRepository.findById(oauthAccount.user_id);
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      // Update last login
      await userRepository.update(user.id, { last_login_at: new Date() });

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
      const user = await userRepository.create({
        email: providerData.email,
        first_name: providerData.first_name,
        last_name: providerData.last_name,
        profile_picture_url: providerData.picture,
        is_verified: true,
        email_verified_at: new Date(),
        auth_type: 'oauth',
      });

      // Create OAuth account
      await oauthAccountRepository.create({
        user_id: user.id,
        provider,
        provider_user_id: providerData.id,
        access_token: providerData.access_token,
        refresh_token: providerData.refresh_token,
        expires_at: providerData.expires_at,
      });

      // Assign default role (individual)
      const role = await roleRepository.findByName('individual');
      await roleRepository.assignToUser(user.id, role.id);

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
  await tokenRepository.createRefreshToken({
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
  const refreshTokens = await tokenRepository.findValidRefreshTokens();

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
  const user = await userRepository.findById(validToken.user_id);
  if (!user || !user.is_active) {
    throw new Error('User not found or inactive');
  }

  // Revoke old refresh token
  await tokenRepository.revokeRefreshToken(validToken.id);

  // Generate new tokens
  return await generateTokens(user);
}

export async function logout(refreshToken) {
  // Find and revoke refresh token
  const refreshTokens = await tokenRepository.findValidRefreshTokens();

  for (const token of refreshTokens) {
    const isValid = await bcrypt.compare(refreshToken, token.token_hash);
    if (isValid) {
      await tokenRepository.revokeRefreshToken(token.id);
      break;
    }
  }
}

// Password Reset
export async function forgotPassword(email) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await bcrypt.hash(resetToken, 10);

  // Store reset token
  await tokenRepository.createPasswordResetToken({
    user_id: user.id,
    token_hash: resetTokenHash,
    expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  return resetToken;
}

export async function resetPassword(token, newPassword) {
  // Find reset token
  const resetTokens = await tokenRepository.findValidPasswordResetTokens();

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
  await userRepository.update(validToken.user_id, {
    password_hash: hashedPassword,
  });

  // Mark token as used
  await tokenRepository.markPasswordResetTokenAsUsed(validToken.id);
}

// Email Verification
export async function sendVerificationEmail(email) {
  const user = await userRepository.findByEmail(email);
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
  await tokenRepository.createEmailVerificationToken({
    user_id: user.id,
    token_hash: verificationTokenHash,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  return verificationToken;
}

export async function verifyEmail(token) {
  // Find verification token
  const verificationTokens = await tokenRepository.findValidEmailVerificationTokens();

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
  await userRepository.update(validToken.user_id, {
    is_verified: true,
    email_verified_at: new Date(),
  });

  // Mark token as used
  await tokenRepository.markEmailVerificationTokenAsUsed(validToken.id);
}

// Utility methods
export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await userRepository.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function getUserPermissions(userId) {
  return await permissionRepository.getUserPermissions(userId);
} 