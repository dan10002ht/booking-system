/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Insert default roles
  const roles = await knex('roles').insert([
    {
      name: 'admin',
      description: 'System administrator with full access',
    },
    {
      name: 'organization',
      description: 'Event organization with event management permissions',
    },
    {
      name: 'individual',
      description: 'Individual user with booking permissions',
    },
  ]).returning('*');

  // Insert default permissions
  const permissions = await knex('permissions').insert([
    // User management
    {
      name: 'users.read',
      description: 'Read user information',
      resource: 'users',
      action: 'read',
    },
    {
      name: 'users.create',
      description: 'Create new users',
      resource: 'users',
      action: 'create',
    },
    {
      name: 'users.update',
      description: 'Update user information',
      resource: 'users',
      action: 'update',
    },
    {
      name: 'users.delete',
      description: 'Delete users',
      resource: 'users',
      action: 'delete',
    },

    // Organization management
    {
      name: 'organizations.read',
      description: 'Read organization information',
      resource: 'organizations',
      action: 'read',
    },
    {
      name: 'organizations.create',
      description: 'Create new organizations',
      resource: 'organizations',
      action: 'create',
    },
    {
      name: 'organizations.update',
      description: 'Update organization information',
      resource: 'organizations',
      action: 'update',
    },
    {
      name: 'organizations.delete',
      description: 'Delete organizations',
      resource: 'organizations',
      action: 'delete',
    },

    // Booking management
    {
      name: 'bookings.read',
      description: 'Read booking information',
      resource: 'bookings',
      action: 'read',
    },
    {
      name: 'bookings.create',
      description: 'Create new bookings',
      resource: 'bookings',
      action: 'create',
    },
    {
      name: 'bookings.update',
      description: 'Update booking information',
      resource: 'bookings',
      action: 'update',
    },
    {
      name: 'bookings.delete',
      description: 'Delete bookings',
      resource: 'bookings',
      action: 'delete',
    },

    // Event management
    {
      name: 'events.read',
      description: 'Read event information',
      resource: 'events',
      action: 'read',
    },
    {
      name: 'events.create',
      description: 'Create new events',
      resource: 'events',
      action: 'create',
    },
    {
      name: 'events.update',
      description: 'Update event information',
      resource: 'events',
      action: 'update',
    },
    {
      name: 'events.delete',
      description: 'Delete events',
      resource: 'events',
      action: 'delete',
    },

    // Payment management
    {
      name: 'payments.read',
      description: 'Read payment information',
      resource: 'payments',
      action: 'read',
    },
    {
      name: 'payments.create',
      description: 'Create new payments',
      resource: 'payments',
      action: 'create',
    },
    {
      name: 'payments.update',
      description: 'Update payment information',
      resource: 'payments',
      action: 'update',
    },
    {
      name: 'payments.delete',
      description: 'Delete payments',
      resource: 'payments',
      action: 'delete',
    },
  ]).returning('*');

  // Create role-permission mappings
  const adminRole = roles.find(r => r.name === 'admin');
  const organizationRole = roles.find(r => r.name === 'organization');
  const individualRole = roles.find(r => r.name === 'individual');

  const rolePermissions = [];

  // Admin gets all permissions
  permissions.forEach(permission => {
    rolePermissions.push({
      role_id: adminRole.id,
      permission_id: permission.id,
    });
  });

  // Organization gets event and booking permissions
  const orgPermissions = permissions.filter(p => 
    p.resource === 'events' || 
    p.resource === 'bookings' || 
    p.resource === 'organizations' ||
    (p.resource === 'users' && p.action === 'read')
  );
  
  orgPermissions.forEach(permission => {
    rolePermissions.push({
      role_id: organizationRole.id,
      permission_id: permission.id,
    });
  });

  // Individual gets booking and payment permissions
  const individualPermissions = permissions.filter(p => 
    p.resource === 'bookings' || 
    p.resource === 'payments' ||
    (p.resource === 'users' && p.action === 'read')
  );
  
  individualPermissions.forEach(permission => {
    rolePermissions.push({
      role_id: individualRole.id,
      permission_id: permission.id,
    });
  });

  await knex('role_permissions').insert(rolePermissions);

  // Create default admin user
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await knex('users').insert({
    email: 'admin@bookingsystem.com',
    password_hash: hashedPassword,
    first_name: 'System',
    last_name: 'Administrator',
    is_active: true,
    is_verified: true,
    email_verified_at: new Date(),
    auth_type: 'email',
  }).returning('*');

  // Assign admin role to admin user
  await knex('user_roles').insert({
    user_id: adminUser[0].id,
    role_id: adminRole.id,
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('user_roles').del();
  await knex('role_permissions').del();
  await knex('users').del();
  await knex('permissions').del();
  await knex('roles').del();
} 