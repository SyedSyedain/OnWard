import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listingCard, listingGrid } from '../src/components/listingCard.js';
import { searchFilters } from '../src/components/searchFilters.js';
import { bookingWidget } from '../src/components/bookingWidget.js';
import { reviewList } from '../src/components/reviewList.js';
import { listingDetail } from '../src/components/listingDetail.js';
import { createInitialState } from '../src/state/reducer.js';
import { makeListing, makeReview, makeStay, TODAY } from './helpers.js';

test('listingCard shows title, city and price', () => {
  const html = listingCard(makeListing(), { isFavourite: false });
  assert.match(html, /Test Flat/);
  assert.match(html, /Pune/);
  assert.match(html, /₹800/);
  assert.match(html, /data-action="toggle-favourite"/);
});

test('listingCard escapes the title', () => {
  const html = listingCard(makeListing({ title: '<script>x</script>' }), { isFavourite: false });
  assert.ok(!html.includes('<script>x'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('listingCard marks favourites as active', () => {
  assert.match(listingCard(makeListing(), { isFavourite: true }), /is-active/);
  assert.ok(!listingCard(makeListing(), { isFavourite: false }).includes('is-active'));
});

test('listingGrid shows an empty state', () => {
  assert.match(listingGrid([], { favourites: [] }), /No stays match/);
});

test('searchFilters reflects the current filters', () => {
  const filters = { ...createInitialState().filters, query: 'goa', amenities: ['pool'], sort: 'rating' };
  const html = searchFilters(filters);
  assert.match(html, /value="goa"/);
  assert.match(html, /value="pool" checked/);
  assert.match(html, /value="rating" selected/);
});

test('bookingWidget prompts for dates, shows errors and shows a quote', () => {
  const listing = makeListing();
  assert.match(bookingWidget(listing, makeStay({ checkIn: '', checkOut: '' }), TODAY), /Add dates/);
  assert.match(bookingWidget(listing, makeStay({ checkOut: '2026-03-09' }), TODAY), /Check-out must be after check-in/);
  const html = bookingWidget(listing, makeStay(), TODAY);
  assert.match(html, /10 Mar - 13 Mar 2026/);
  assert.match(html, /class="total"/);
});

test('reviewList escapes author and text', () => {
  const html = reviewList([makeReview({ author: 'A<b>', text: '<img src=x onerror=alert(1)>' })]);
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img'));
  assert.match(reviewList([]), /No reviews yet/);
});

test('listingDetail shows the review summary for reviewed listings', () => {
  const html = listingDetail(makeListing(), createInitialState(), TODAY);
  assert.match(html, /★ 4\.5 · 2 reviews/);
});
