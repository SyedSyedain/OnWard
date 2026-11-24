/**
 * Validation for the booking form.
 */

const MAX_REASON_LENGTH = 200;

/**
 * Strips spaces, dashes and brackets and removes a +91 or leading 0 prefix.
 * @param {string} raw
 * @returns {string} the remaining characters
 */
export function normalizePhone(raw) {
  let phone = String(raw ?? '').replace(/[\s\-().]/g, '');
  if (phone.startsWith('+91')) phone = phone.slice(3);
  else if (/^0\d{10}$/.test(phone)) phone = phone.slice(1);
  return phone;
}

/**
 * Checks that a phone number is a valid mobile number.
 * @param {string} raw
 * @returns {boolean}
 */
export function isValidPhone(raw) {
  return /^\d{9,10}$/.test(normalizePhone(raw));
}

/**
 * Validates the booking form values.
 * @param {{name?: string, phone?: string, reason?: string}} values
 * @returns {{valid: boolean, errors: {name?: string, phone?: string, reason?: string}}}
 */
export function validateBooking(values) {
  const errors = {};
  const name = (values.name ?? '').trim();
  const reason = (values.reason ?? '').trim();

  if (name.length < 2) errors.name = 'Enter your full name.';
  if (!isValidPhone(values.phone)) errors.phone = 'Enter a valid 10-digit phone number.';
  if (!reason) errors.reason = 'Tell us briefly why you are visiting.';
  else if (reason.length > MAX_REASON_LENGTH) errors.reason = 'Keep the reason under 200 characters.';

  return { valid: Object.keys(errors).length === 0, errors };
}
