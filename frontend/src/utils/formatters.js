/**
 * Data and display formatting utilities for the Library Management System.
 */

/**
 * Format a date string or timestamp into a readable date (e.g., "Nov 17, 2026").
 * @param {string|number|Date} dateInput
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid date';

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format a date string or timestamp into full date and time (e.g., "Nov 17, 2026, 9:27 PM").
 * @param {string|number|Date} dateInput
 * @returns {string}
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid date';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format a relative time description (e.g. "Just now", "5m ago", "2h ago", "Yesterday").
 * @param {string|number|Date} dateInput
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;

    if (isNaN(diffMs)) return 'Invalid date';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format numbers with thousands separators (e.g., 1,234).
 * @param {number|string} value
 * @returns {string}
 */
export function formatNumber(value) {
  const num = Number(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Capitalize and format user role names.
 * @param {string} role
 * @returns {string}
 */
export function formatRole(role) {
  if (!role) return 'Unknown';
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Administrator';
    case 'librarian':
      return 'Librarian';
    case 'student':
      return 'Student Member';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

/**
 * Format transaction action type label.
 * @param {string} type
 * @returns {string}
 */
export function formatTransactionType(type) {
  if (!type) return 'Unknown';
  switch (type.toLowerCase()) {
    case 'borrow':
      return 'Borrowed';
    case 'return':
      return 'Returned';
    case 'restock':
      return 'Restocked';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

/**
 * Clean and format ISBN numbers.
 * @param {string} isbn
 * @returns {string}
 */
export function formatISBN(isbn) {
  if (!isbn) return '—';
  const clean = isbn.replace(/[^0-9X-]/gi, '');
  return clean || isbn;
}
