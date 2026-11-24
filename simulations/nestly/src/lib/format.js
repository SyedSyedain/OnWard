/**
 * Formatting helpers for prices, ratings and counts.
 */

/**
 * Formats a whole-rupee amount for display, e.g. 4500 -> "₹4,500".
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return `₹${Math.round(amount)}`;
}

/**
 * Returns the average of review ratings, or null when there are no reviews.
 * @param {{rating: number}[]} reviews
 * @returns {number|null}
 */
export function averageRating(reviews) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
}

/**
 * Label for an average rating, e.g. "★ 4.5", or "New" when there is none yet.
 * @param {number|null} average
 * @returns {string}
 */
export function ratingLabel(average) {
  if (average === null) return 'New';
  return `★ ${average.toFixed(1)}`;
}

/**
 * Pluralises a noun: pluralize(1, 'night') -> "1 night", pluralize(3, 'night') -> "3 nights".
 * @param {number} count
 * @param {string} noun
 * @returns {string}
 */
export function pluralize(count, noun) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
