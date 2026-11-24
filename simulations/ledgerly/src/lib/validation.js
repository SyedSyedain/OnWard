/**
 * Small input checks shared by the services.
 */

import { ValidationError } from './errors.js';

/**
 * Returns a trimmed copy of a required text field.
 * @param {unknown} value
 * @param {string} label Field name used in the error message.
 * @returns {string}
 * @throws {ValidationError} when the value is not a non-blank string.
 */
export function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${label} is required`);
  }
  return value.trim();
}
