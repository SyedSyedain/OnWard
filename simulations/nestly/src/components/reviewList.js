/**
 * Review list and summary.
 */

import { escapeHtml } from '../lib/html.js';
import { averageRating, pluralize, ratingLabel } from '../lib/format.js';

/**
 * @param {{rating: number}[]} reviews
 * @returns {string} e.g. "★ 4.5 · 2 reviews"
 */
export function reviewSummary(reviews) {
  return `${ratingLabel(averageRating(reviews))} · ${pluralize(reviews.length, 'review')}`;
}

/**
 * @param {{author: string, rating: number, text: string}[]} reviews
 * @returns {string}
 */
export function reviewList(reviews) {
  if (reviews.length === 0) return '<p class="reviews-empty">No reviews yet.</p>';
  const items = reviews
    .map(
      (review) => `<li class="review">
  <strong>${escapeHtml(review.author)}</strong> <span>${'★'.repeat(review.rating)}</span>
  <p>${escapeHtml(review.text)}</p>
</li>`,
    )
    .join('\n');
  return `<ul class="reviews">\n${items}\n</ul>`;
}
