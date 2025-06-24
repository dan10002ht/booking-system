/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Insert default roles
  const roles = await knex('roles').insert([
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'admin',
      description: 'System administrator with full access',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'organization',
      description: 'Event organization with event management permissions',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'individual',
      description: 'Individual user with booking permissions',
    },
  ]).returning('*');

  // Insert default permissions
  const permissions = await knex('permissions').insert([
    // User management
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'users.read',
      description: 'Read user information',
      resource: 'users',
      action: 'read',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'users.create',
      description: 'Create new users',
      resource: 'users',
      action: 'create',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'users.update',
      description: 'Update user information',
      resource: 'users',
      action: 'update',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'users.delete',
      description: 'Delete users',
      resource: 'users',
      action: 'delete',
    },

    // Organization management
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'organizations.read',
      description: 'Read organization information',
      resource: 'organizations',
      action: 'read',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'organizations.create',
      description: 'Create new organizations',
      resource: 'organizations',
      action: 'create',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'organizations.update',
      description: 'Update organization information',
      resource: 'organizations',
      action: 'update',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'organizations.delete',
      description: 'Delete organizations',
      resource: 'organizations',
      action: 'delete',
    },

    // Booking management
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'bookings.read',
      description: 'Read booking information',
      resource: 'bookings',
      action: 'read',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'bookings.create',
      description: 'Create new bookings',
      resource: 'bookings',
      action: 'create',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'bookings.update',
      description: 'Update booking information',
      resource: 'bookings',
      action: 'update',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'bookings.delete',
      description: 'Delete bookings',
      resource: 'bookings',
      action: 'delete',
    },

    // Event management
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'events.read',
      description: 'Read event information',
      resource: 'events',
      action: 'read',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'events.create',
      description: 'Create new events',
      resource: 'events',
      action: 'create',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'events.update',
      description: 'Update event information',
      resource: 'events',
      action: 'update',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'events.delete',
      description: 'Delete events',
      resource: 'events',
      action: 'delete',
    },

    // Payment management
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'payments.read',
      description: 'Read payment information',
      resource: 'payments',
      action: 'read',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'payments.create',
      description: 'Create new payments',
      resource: 'payments',
      action: 'create',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
      name: 'payments.update',
      description: 'Update payment information',
      resource: 'payments',
      action: 'update',
    },
    {
      public_id: knex.raw('gen_random_uuid()'),
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
      public_id: knex.raw('gen_random_uuid()'),
      role_id: adminRole.public_id,
      permission_id: permission.public_id,
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
      public_id: knex.raw('gen_random_uuid()'),
      role_id: organizationRole.public_id,
      permission_id: permission.public_id,
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
      public_id: knex.raw('gen_random_uuid()'),
      role_id: individualRole.public_id,
      permission_id: permission.public_id,
    });
  });

  await knex('role_permissions').insert(rolePermissions);

  // Create default admin user
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await knex('users').insert({
    public_id: knex.raw('gen_random_uuid()'),
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
    public_id: knex.raw('gen_random_uuid()'),
    user_id: adminUser[0].public_id,
    role_id: adminRole.public_id,
  });

  // Create organization roles for existing organizations
  const organizations = await knex('organizations').select('*');
  
  for (const org of organizations) {
    // Create default organization roles for each organization
    const orgRoles = await knex('organization_roles').insert([
      {
        public_id: knex.raw('gen_random_uuid()'),
        organization_id: org.public_id,
        name: 'admin',
        description: 'Organization administrator with full control',
        permissions: JSON.stringify({
          'organization': ['read', 'update', 'delete'],
          'members': ['read', 'create', 'update', 'delete', 'invite'],
          'events': ['read', 'create', 'update', 'delete'],
          'bookings': ['read', 'create', 'update', 'delete'],
          'analytics': ['read'],
          'settings': ['read', 'update']
        }),
        hierarchy_level: 0,
        is_default: false
      },
      {
        public_id: knex.raw('gen_random_uuid()'),
        organization_id: org.public_id,
        name: 'manager',
        description: 'Event manager with event and booking management',
        permissions: JSON.stringify({
          'organization': ['read'],
          'members': ['read', 'invite'],
          'events': ['read', 'create', 'update', 'delete'],
          'bookings': ['read', 'create', 'update', 'delete'],
          'analytics': ['read'],
          'settings': ['read']
        }),
        hierarchy_level: 10,
        is_default: false
      },
      {
        public_id: knex.raw('gen_random_uuid()'),
        organization_id: org.public_id,
        name: 'member',
        description: 'Organization member with basic access',
        permissions: JSON.stringify({
          'organization': ['read'],
          'events': ['read', 'create'],
          'bookings': ['read', 'create'],
          'analytics': ['read']
        }),
        hierarchy_level: 50,
        is_default: true
      },
      {
        public_id: knex.raw('gen_random_uuid()'),
        organization_id: org.public_id,
        name: 'viewer',
        description: 'Read-only access to organization data',
        permissions: JSON.stringify({
          'organization': ['read'],
          'events': ['read'],
          'bookings': ['read'],
          'analytics': ['read']
        }),
        hierarchy_level: 100,
        is_default: false
      }
    ]).returning('*');

    // Get the organization owner (user who created the organization)
    const orgOwner = await knex('users').where('public_id', org.user_id).first();
    
    if (orgOwner) {
      // Find admin role
      const adminRole = orgRoles.find(r => r.name === 'admin');
      
      // Add organization owner as admin member
      await knex('organization_members').insert({
        public_id: knex.raw('gen_random_uuid()'),
        organization_id: org.public_id,
        user_id: org.user_id,
        role_id: adminRole.public_id,
        status: 'active',
        joined_at: org.created_at,
        last_active_at: new Date()
      });
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('organization_members').del();
  await knex('organization_roles').del();
  await knex('user_roles').del();
  await knex('role_permissions').del();
  await knex('users').del();
  await knex('permissions').del();
  await knex('roles').del();
} 