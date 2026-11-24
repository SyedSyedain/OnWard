import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderCard } from '../../src/components/card.js';
import { renderColumn } from '../../src/components/column.js';
import { makeCard, NOW } from '../helpers.js';

test('[acceptance] markup in a card title is escaped', () => {
  const html = renderCard(makeCard({ title: '<script>alert(1)</script>' }), NOW);
  assert.doesNotMatch(html, /<script>/);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('[acceptance] quotes and ampersands in a title are escaped too', () => {
  const html = renderCard(makeCard({ title: 'Fix "R&D" <b>page</b>' }), NOW);
  assert.ok(html.includes('Fix &quot;R&amp;D&quot; &lt;b&gt;page&lt;/b&gt;'));
  const column = renderColumn({ id: 'todo', title: 'To do', count: 1, cards: [makeCard({ title: '<img src=x>' })] }, NOW);
  assert.doesNotMatch(column, /<img/);
});

test('[acceptance] an ordinary title is shown unchanged', () => {
  const html = renderCard(makeCard({ title: 'Write release notes' }), NOW);
  assert.match(html, /<h3 class="card-title">Write release notes<\/h3>/);
});
