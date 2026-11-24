/**
 * HTML helpers shared by every component.
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escapes text so it is safe to place inside HTML content or a quoted attribute.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/**
 * Renders a boolean HTML attribute (for example `checked`) or an empty string.
 * @param {string} name
 * @param {boolean} on
 * @returns {string}
 */
export function boolAttr(name, on) {
  return on ? ` ${name}` : '';
}
