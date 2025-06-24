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
    phone: input.phone?.trim()
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
    offset: (sanitizedPage - 1) * sanitizedPageSize
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
  const { password_hash, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Sanitize session data
 */
export function sanitizeSessionData(sessionData) {
  return {
    ip_address: sessionData.ip_address?.trim(),
    user_agent: sessionData.user_agent?.trim()
  };
} 