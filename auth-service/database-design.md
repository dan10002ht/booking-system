# Database Design - Auth Service

## Overview

The Auth Service manages user authentication, authorization, and session management for the booking system. This document outlines the database schema and relationships.

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    auth_type VARCHAR(20) DEFAULT 'email', -- 'email' or 'oauth'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Organizations Table

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    tax_id VARCHAR(50),
    business_license VARCHAR(100),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OAuth Accounts Table

```sql
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', etc.
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id),
    UNIQUE(user_id, provider)
);
```

### User Roles Table

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);
```

### Roles Table

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Permissions Table

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Role Permissions Table

```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);
```

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Password Reset Tokens Table

```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Email Verification Tokens Table

```sql
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Sessions Table

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Entity Relationship Diagram (ERD)

```
Users (1) -------- (1) Organizations
  |                    |
  |                    |
  | (1) -------- (N) OAuthAccounts
  |                    |
  | (1) -------- (N) UserRoles (N) -------- (1) Roles
  |                                                |
  |                                                |
  | (1) -------- (N) RefreshTokens                |
  |                                                |
  | (1) -------- (N) PasswordResetTokens          |
  |                                                |
  | (1) -------- (N) EmailVerificationTokens      |
  |                                                |
  | (1) -------- (N) UserSessions                 |
  |                                                |
  | (1) -------- (N) AuditLogs                    |
  |                                                |
  |                                                |
Roles (1) -------- (N) RolePermissions (N) -------- (1) Permissions
```

## Key Relationships

1. **Users to Organizations**: One-to-one relationship (only for organization users)
2. **Users to OAuth Accounts**: One-to-many relationship for multiple OAuth providers
3. **Users to Roles**: Many-to-many relationship through `user_roles` table
4. **Roles to Permissions**: Many-to-many relationship through `role_permissions` table
5. **Users to Tokens**: One-to-many relationships for various token types
6. **Users to Sessions**: One-to-many relationship for session management
7. **Users to Audit Logs**: One-to-many relationship for activity tracking

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_users_auth_type ON users(auth_type);

CREATE INDEX idx_organizations_user_id ON organizations(user_id);
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_is_verified ON organizations(is_verified);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);
CREATE INDEX idx_oauth_accounts_provider_user_id ON oauth_accounts(provider, provider_user_id);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
```

## Default Data

### Default Roles

```sql
INSERT INTO roles (name, description) VALUES
('admin', 'System administrator with full access'),
('organization', 'Event organization with event management permissions'),
('individual', 'Individual user with booking permissions');
```

### Default Permissions

```sql
INSERT INTO permissions (name, description, resource, action) VALUES
-- User management
('users.read', 'Read user information', 'users', 'read'),
('users.create', 'Create new users', 'users', 'create'),
('users.update', 'Update user information', 'users', 'update'),
('users.delete', 'Delete users', 'users', 'delete'),

-- Organization management
('organizations.read', 'Read organization information', 'organizations', 'read'),
('organizations.create', 'Create new organizations', 'organizations', 'create'),
('organizations.update', 'Update organization information', 'organizations', 'update'),
('organizations.delete', 'Delete organizations', 'organizations', 'delete'),

-- Booking management
('bookings.read', 'Read booking information', 'bookings', 'read'),
('bookings.create', 'Create new bookings', 'bookings', 'create'),
('bookings.update', 'Update booking information', 'bookings', 'update'),
('bookings.delete', 'Delete bookings', 'bookings', 'delete'),

-- Event management
('events.read', 'Read event information', 'events', 'read'),
('events.create', 'Create new events', 'events', 'create'),
('events.update', 'Update event information', 'events', 'update'),
('events.delete', 'Delete events', 'events', 'delete'),

-- Payment management
('payments.read', 'Read payment information', 'payments', 'read'),
('payments.create', 'Create new payments', 'payments', 'create'),
('payments.update', 'Update payment information', 'payments', 'update'),
('payments.delete', 'Delete payments', 'payments', 'delete');
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt with salt
2. **Token Security**: All tokens are hashed before storage
3. **Session Management**: Sessions have expiration times and can be revoked
4. **Audit Trail**: All user actions are logged for security monitoring
5. **Role-Based Access Control**: Granular permissions based on user roles
6. **Input Validation**: All user inputs are validated and sanitized
7. **SQL Injection Prevention**: Using parameterized queries
8. **Rate Limiting**: Implemented at the API level
9. **OAuth Security**: Secure OAuth token handling and validation

## Migration Strategy

1. **Version Control**: All schema changes are versioned using migration files
2. **Backward Compatibility**: New migrations maintain backward compatibility
3. **Data Migration**: Proper data migration scripts for schema changes
4. **Rollback Support**: Ability to rollback migrations if needed
5. **Testing**: All migrations are tested in development environment first
