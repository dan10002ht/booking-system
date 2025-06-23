/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255); // NULL for OAuth users
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20);
    table.date('date_of_birth');
    table.string('gender', 10);
    table.text('address');
    table.string('city', 100);
    table.string('state', 100);
    table.string('country', 100);
    table.string('postal_code', 20);
    table.text('profile_picture_url');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('email_verified_at');
    table.timestamp('phone_verified_at');
    table.timestamp('last_login_at');
    table.string('auth_type', 20).defaultTo('email'); // 'email' or 'oauth'
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create organizations table
  await knex.schema.createTable('organizations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('description');
    table.text('website_url');
    table.text('logo_url');
    table.string('tax_id', 50);
    table.string('business_license', 100);
    table.string('contact_person', 100);
    table.string('contact_phone', 20);
    table.string('contact_email', 255);
    table.text('address');
    table.string('city', 100);
    table.string('state', 100);
    table.string('country', 100);
    table.string('postal_code', 20);
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('verified_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create oauth_accounts table
  await knex.schema.createTable('oauth_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('provider', 50).notNullable(); // 'google', 'facebook', etc.
    table.string('provider_user_id', 255).notNullable();
    table.text('access_token');
    table.text('refresh_token');
    table.timestamp('expires_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique(['provider', 'provider_user_id']);
    table.unique(['user_id', 'provider']);
  });

  // Create roles table
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).unique().notNullable();
    table.text('description');
    table.jsonb('permissions');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create permissions table
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).unique().notNullable();
    table.text('description');
    table.string('resource', 100).notNullable();
    table.string('action', 50).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Create user_roles table
  await knex.schema.createTable('user_roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'role_id']);
  });

  // Create role_permissions table
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('permission_id').notNullable().references('id').inTable('permissions').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['role_id', 'permission_id']);
  });

  // Create refresh_tokens table
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).unique().notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_revoked').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create password_reset_tokens table
  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).unique().notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_used').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Create email_verification_tokens table
  await knex.schema.createTable('email_verification_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).unique().notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_used').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Create user_sessions table
  await knex.schema.createTable('user_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('session_id', 255).unique().notNullable();
    table.inet('ip_address');
    table.text('user_agent');
    table.timestamp('expires_at').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create audit_logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('resource_type', 100);
    table.uuid('resource_id');
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.inet('ip_address');
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('user_sessions');
  await knex.schema.dropTableIfExists('email_verification_tokens');
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('oauth_accounts');
  await knex.schema.dropTableIfExists('organizations');
  await knex.schema.dropTableIfExists('users');
} 