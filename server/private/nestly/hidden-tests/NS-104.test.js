import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeListing, makeStay, TODAY } from '../helpers.js';
import { nightsBetween } from '../../src/lib/dates.js';
import { quoteStay } from '../../src/lib/pricing.js';
import { bookingWidget } from '../../src/components/bookingWidget.js';

test('[acceptance] the night count is the number of nights between check-in and check-out', () => {
  assert.equal(nightsBetween('2026-03-10', '2026-03-13'), 3);
  assert.equal(nightsBetween('2026-03-10', '2026-03-11'), 1);
  assert.equal(nightsBetween('2026-02-27', '2026-03-02'), 3);
});

test('[acceptance] the quote and booking widget price only the nights stayed', () => {
  const listing = makeListing({ pricePerNight: 2000, cleaningFee: 500 });
  const quote = quoteStay(listing, makeStay(), TODAY);
  assert.equal(quote.nights, 3);
  assert.equal(quote.subtotal, 6000);
  assert.equal(quote.serviceFee, 600);
  assert.equal(quote.total, 7100);
  const html = bookingWidget(listing, makeStay(), TODAY);
  assert.match(html, /<dd class="nights">3 nights<\/dd>/);
  assert.match(html, /class="total">₹7,?100</);
});

test('[acceptance] invalid stays are still rejected with no quote', () => {
  const listing = makeListing();
  assert.equal(quoteStay(listing, makeStay({ checkOut: '2026-03-10' }), TODAY), null);
  assert.equal(quoteStay(listing, makeStay({ checkOut: '' }), TODAY), null);
  assert.equal(nightsBetween('', '2026-03-10'), 0);
});
