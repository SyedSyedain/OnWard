import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, averageRating, ratingLabel, pluralize } from '../src/lib/format.js';
import { parseISODate, formatDateRange, validateStay } from '../src/lib/dates.js';
import { quoteStay } from '../src/lib/pricing.js';
import { escapeHtml } from '../src/lib/html.js';
import { makeListing, makeReview, makeStay, TODAY } from './helpers.js';

test('formatPrice shows the rupee sign and small amounts', () => {
  assert.equal(formatPrice(800), '₹800');
});

test('averageRating averages review ratings', () => {
  assert.equal(averageRating([makeReview({ rating: 4 }), makeReview({ rating: 5 })]), 4.5);
  assert.equal(ratingLabel(4.5), '★ 4.5');
});

test('pluralize handles one and many', () => {
  assert.equal(pluralize(1, 'night'), '1 night');
  assert.equal(pluralize(3, 'night'), '3 nights');
});

test('parseISODate accepts real dates and rejects impossible ones', () => {
  assert.equal(parseISODate('2026-03-10'), Date.UTC(2026, 2, 10));
  assert.equal(parseISODate('2026-02-30'), null);
  assert.equal(parseISODate('10/03/2026'), null);
});

test('formatDateRange labels a stay', () => {
  assert.equal(formatDateRange('2026-03-10', '2026-03-13'), '10 Mar - 13 Mar 2026');
});

test('validateStay reports bad input', () => {
  const listing = makeListing({ maxGuests: 4 });
  assert.deepEqual(validateStay(makeStay(), listing, TODAY), []);
  assert.equal(validateStay(makeStay({ checkOut: '2026-03-10' }), listing, TODAY).length, 1);
  assert.equal(validateStay(makeStay({ checkIn: '2026-02-20' }), listing, TODAY).length, 1);
  assert.equal(validateStay(makeStay({ guests: 5 }), listing, TODAY).length, 1);
  assert.equal(validateStay(makeStay({ checkIn: '' }), listing, TODAY).length, 1);
});

test('quoteStay returns null for an invalid stay', () => {
  assert.equal(quoteStay(makeListing(), makeStay({ checkOut: '2026-03-09' }), TODAY), null);
});

test('escapeHtml escapes markup characters', () => {
  assert.equal(escapeHtml('<b>"A" & \'B\'</b>'), '&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;');
});
