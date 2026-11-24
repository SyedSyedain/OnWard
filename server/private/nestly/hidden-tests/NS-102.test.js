import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeListing } from '../helpers.js';
import { listingCard } from '../../src/components/listingCard.js';

test('[acceptance] the favourite button reports aria-pressed="false" when not saved', () => {
  const html = listingCard(makeListing(), { isFavourite: false });
  assert.match(html, /aria-pressed="false"/);
});

test('[acceptance] the favourite button reports aria-pressed="true" when saved', () => {
  const html = listingCard(makeListing(), { isFavourite: true });
  assert.match(html, /aria-pressed="true"/);
});

test('[acceptance] the favourite button has an accessible label naming the listing and keeps its data attributes', () => {
  const html = listingCard(makeListing({ id: 'l-9', title: 'Blue Door Flat' }), { isFavourite: false });
  const button = html.match(/<button[^>]*>/)[0];
  assert.match(button, /aria-label="[^"]*Blue Door Flat[^"]*"/);
  assert.match(button, /data-action="toggle-favourite"/);
  assert.match(button, /data-id="l-9"/);
});
