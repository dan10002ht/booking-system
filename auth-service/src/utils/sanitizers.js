/**
 * Input sanitization utility functions
 */

/**
 * Sanitize user input data
 */
export function sanitizeUserInput(input) {
  return {
    ...input,
    email: input.email?.toLowerCase().trim(),
    username: input.username?.toLowerCase().trim(),
    first_name: input.first_name?.trim(),
    last_name: input.last_name?.trim(),
    phone: input.phone?.trim(),
  };
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email) {
  return email?.toLowerCase().trim();
}

/**
 * Sanitize username
 */
export function sanitizeUsername(username) {
  return username?.toLowerCase().trim();
}

/**
 * Sanitize name fields
 */
export function sanitizeName(name) {
  return name?.trim();
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone) {
  return phone?.trim();
}

/**
 * Sanitize search term
 */
export function sanitizeSearchTerm(term) {
  return term?.trim().toLowerCase();
}

/**
 * Sanitize pagination parameters
 */
export function sanitizePagination(page, pageSize, maxPageSize = 100) {
  const sanitizedPage = Math.max(1, parseInt(page) || 1);
  const sanitizedPageSize = Math.min(maxPageSize, Math.max(1, parseInt(pageSize) || 20));

  return {
    page: sanitizedPage,
    pageSize: sanitizedPageSize,
    offset: (sanitizedPage - 1) * sanitizedPageSize,
  };
}

/**
 * Sanitize filter parameters
 */
export function sanitizeFilters(filters) {
  const sanitized = {};

  if (filters.status) {
    sanitized.status = filters.status.trim().toLowerCase();
  }

  if (filters.role) {
    sanitized.role = filters.role.trim().toLowerCase();
  }

  if (filters.orderBy) {
    sanitized.orderBy = filters.orderBy.trim().toLowerCase();
  }

  if (filters.orderDirection) {
    sanitized.orderDirection = filters.orderDirection.trim().toLowerCase();
  }

  return sanitized;
}

/**
 * Remove sensitive data from user object
 */
export function sanitizeUserForResponse(user) {
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Sanitize session data
 */
export function sanitizeSessionData(sessionData) {
  return {
    ip_address: sessionData.ip_address?.trim(),
    user_agent: sessionData.user_agent?.trim(),
  };
}

/**
 * Sanitize organization input data
 */
export function sanitizeOrganizationInput(input) {
  return {
    ...input,
    name: input.name?.trim(),
    description: input.description?.trim(),
    website: input.website?.trim(),
    phone: input.phone?.trim(),
    email: input.email?.toLowerCase().trim(),
    address: input.address?.trim(),
    city: input.city?.trim(),
    state: input.state?.trim(),
    country: input.country?.trim(),
    postal_code: input.postal_code?.trim(),
    tax_id: input.tax_id?.trim(),
    industry: input.industry?.trim(),
    size: input.size?.trim().toLowerCase(),
    status: input.status?.trim().toLowerCase(),
  };
}

/**
 * Sanitize organization for response (remove sensitive data)
 */
export function sanitizeOrganizationForResponse(organization) {
  // eslint-disable-next-line no-unused-vars
  const { created_at, updated_at, deleted_at, ...sanitizedOrganization } = organization;

  return {
    ...sanitizedOrganization,
    // Format dates if needed
    created_at: created_at ? new Date(created_at).toISOString() : null,
    updated_at: updated_at ? new Date(updated_at).toISOString() : null,
  };
}
