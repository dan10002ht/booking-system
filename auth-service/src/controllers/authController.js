import authService from '../services/authService.js';
import userService from '../services/userService.js';
import organizationService from '../services/organizationService.js';
import logger from '../utils/logger.js';

// User authentication
export async function register(call, callback) {
  try {
    const { email, password, first_name, last_name, phone, role = 'individual', organization } = call.request;

    const userData = {
      email,
      password,
      first_name,
      last_name,
      phone,
    };

    const user = await authService.register(userData, role);

    callback(null, {
      success: true,
      message: 'User registered successfully',
      user: mapUserToGrpc(user),
    });
  } catch (error) {
    logger.error('Register error:', error);
    callback({
      code: 3, // INVALID_ARGUMENT
      message: error.message,
    });
  }
}

export async function login(call, callback) {
  try {
    const { email, password } = call.request;

    const result = await authService.login(email, password);

    callback(null, {
      success: true,
      message: 'Login successful',
      user: mapUserToGrpc(result.user),
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    callback({
      code: 16, // UNAUTHENTICATED
      message: error.message,
    });
  }
}

export async function oauthLogin(call, callback) {
  try {
    const { provider, access_token, provider_user_id, email, first_name, last_name, picture, refresh_token, expires_at } = call.request;

    const providerData = {
      id: provider_user_id,
      email,
      first_name,
      last_name,
      picture,
      access_token,
      refresh_token,
      expires_at: expires_at ? new Date(expires_at) : null,
    };

    const result = await authService.oauthLogin(provider, providerData);

    callback(null, {
      success: true,
      message: 'OAuth login successful',
      user: mapUserToGrpc(result.user),
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
    });
  } catch (error) {
    logger.error('OAuth login error:', error);
    callback({
      code: 16, // UNAUTHENTICATED
      message: error.message,
    });
  }
}

export async function refreshToken(call, callback) {
  try {
    const { refresh_token } = call.request;

    const tokens = await authService.refreshToken(refresh_token);

    callback(null, {
      success: true,
      message: 'Token refreshed successfully',
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    callback({
      code: 16, // UNAUTHENTICATED
      message: error.message,
    });
  }
}

export async function logout(call, callback) {
  try {
    const { refresh_token } = call.request;

    if (refresh_token) {
      await authService.logout(refresh_token);
    }

    callback(null, {
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    callback({
      code: 13, // INTERNAL
      message: 'Logout failed',
    });
  }
}

// Token verification
export async function verifyToken(call, callback) {
  try {
    const { token } = call.request;

    const user = await authService.verifyToken(token);

    if (!user) {
      return callback({
        code: 16, // UNAUTHENTICATED
        message: 'Invalid or expired token',
      });
    }

    callback(null, {
      success: true,
      message: 'Token verified successfully',
      user: mapUserToGrpc(user),
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    callback({
      code: 16, // UNAUTHENTICATED
      message: 'Invalid token',
    });
  }
}

export async function getUserPermissions(call, callback) {
  try {
    const { user_id } = call.request;

    const permissions = await authService.getUserPermissions(user_id);

    callback(null, {
      success: true,
      message: 'Permissions retrieved successfully',
      permissions: permissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
      })),
    });
  } catch (error) {
    logger.error('Get user permissions error:', error);
    callback({
      code: 13, // INTERNAL
      message: 'Failed to get user permissions',
    });
  }
}

// User management
export async function getUser(call, callback) {
  try {
    const { user_id } = call.request;

    const user = await userService.findWithRoles(user_id);
    if (!user) {
      return callback({
        code: 5, // NOT_FOUND
        message: 'User not found',
      });
    }

    const organization = await organizationService.findByUserId(user_id);

    callback(null, {
      success: true,
      message: 'User retrieved successfully',
      user: mapUserToGrpc(user, organization),
    });
  } catch (error) {
    logger.error('Get user error:', error);
    callback({
      code: 13, // INTERNAL
      message: 'Failed to get user data',
    });
  }
}

export async function updateUser(call, callback) {
  try {
    const { user_id, first_name, last_name, phone, address, city, state, country, postal_code, profile_picture_url } = call.request;

    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (country) updateData.country = country;
    if (postal_code) updateData.postal_code = postal_code;
    if (profile_picture_url) updateData.profile_picture_url = profile_picture_url;

    const user = await userService.update(user_id, updateData);

    callback(null, {
      success: true,
      message: 'User updated successfully',
      user: mapUserToGrpc(user),
    });
  } catch (error) {
    logger.error('Update user error:', error);
    callback({
      code: 13, // INTERNAL
      message: 'Failed to update user',
    });
  }
}

export async function deleteUser(call, callback) {
  try {
    const { user_id } = call.request;

    await userService.delete(user_id);

    callback(null, {
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    callback({
      code: 13, // INTERNAL
      message: 'Failed to delete user',
    });
  }
}

// Password management
export async function forgotPassword(call, callback) {
  try {
    const { email } = call.request;

    const resetToken = await authService.forgotPassword(email);

    callback(null, {
      success: true,
      message: 'Password reset token generated',
      reset_token: resetToken,
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    callback({
      code: 3, // INVALID_ARGUMENT
      message: error.message,
    });
  }
}

export async function resetPassword(call, callback) {
  try {
    const { token, password } = call.request;

    await authService.resetPassword(token, password);

    callback(null, {
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    callback({
      code: 3, // INVALID_ARGUMENT
      message: error.message,
    });
  }
}

// Email verification
export async function sendVerificationEmail(call, callback) {
  try {
    const { email } = call.request;

    const verificationToken = await authService.sendVerificationEmail(email);

    callback(null, {
      success: true,
      message: 'Verification email sent',
      verification_token: verificationToken,
    });
  } catch (error) {
    logger.error('Send verification email error:', error);
    callback({
      code: 3, // INVALID_ARGUMENT
      message: error.message,
    });
  }
}

export async function verifyEmail(call, callback) {
  try {
    const { token } = call.request;

    await authService.verifyEmail(token);

    callback(null, {
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    logger.error('Verify email error:', error);
    callback({
      code: 3, // INVALID_ARGUMENT
      message: error.message,
    });
  }
}

// Health check
export async function healthCheck(call, callback) {
  try {
    callback(null, {
      success: true,
      message: 'Auth service is healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
    });
  } catch (error) {
    logger.error('Health check error:', error);
    callback({
      code: 13, // INTERNAL
      message: 'Service is unhealthy',
    });
  }
}

// Helper functions
function mapUserToGrpc(user, organization = null) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    country: user.country || '',
    postal_code: user.postal_code || '',
    profile_picture_url: user.profile_picture_url || '',
    is_active: user.is_active,
    is_verified: user.is_verified,
    email_verified_at: user.email_verified_at ? user.email_verified_at.toISOString() : '',
    phone_verified_at: user.phone_verified_at ? user.phone_verified_at.toISOString() : '',
    last_login_at: user.last_login_at ? user.last_login_at.toISOString() : '',
    auth_type: user.auth_type,
    created_at: user.created_at ? user.created_at.toISOString() : '',
    updated_at: user.updated_at ? user.updated_at.toISOString() : '',
    roles: user.roles ? user.roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    })) : [],
    organization: organization ? {
      id: organization.id,
      name: organization.name,
      description: organization.description || '',
      website_url: organization.website_url || '',
      logo_url: organization.logo_url || '',
      tax_id: organization.tax_id || '',
      business_license: organization.business_license || '',
      contact_person: organization.contact_person || '',
      contact_phone: organization.contact_phone || '',
      contact_email: organization.contact_email || '',
      address: organization.address || '',
      city: organization.city || '',
      state: organization.state || '',
      country: organization.country || '',
      postal_code: organization.postal_code || '',
      is_verified: organization.is_verified,
      verified_at: organization.verified_at ? organization.verified_at.toISOString() : '',
      created_at: organization.created_at ? organization.created_at.toISOString() : '',
      updated_at: organization.updated_at ? organization.updated_at.toISOString() : '',
    } : null,
  };
} 