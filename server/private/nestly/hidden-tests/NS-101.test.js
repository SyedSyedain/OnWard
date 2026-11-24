import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeListing } from '../helpers.js';
import { formatPrice } from '../../src/lib/format.js';
import { listingCard } from '../../src/components/listingCard.js';

test('[acceptance] a five-digit price is shown with a thousands separator', () => {
  assert.ok(formatPrice(12500).includes('12,500'));
});

test('[acceptance] a four-digit nightly price on a listing card is shown with a thousands separator', () => {
  const html = listingCard(makeListing({ pricePerNight: 4500 }), { isFavourite: false });
  assert.ok(html.includes('₹4,500'));
  assert.ok(formatPrice(1250).includes('1,250'));
});

test('[acceptance] prices below one thousand are unchanged', () => {
  assert.equal(formatPrice(800), '₹800');
  assert.equal(formatPrice(0), '₹0');
});
