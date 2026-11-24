import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderCard } from '../src/components/card.js';
import { renderBoard } from '../src/components/board.js';
import { renderNewCardForm } from '../src/components/newCardForm.js';
import { defaultBoard, makeCard, NOW } from './helpers.js';

test('a card shows its title, assignee and an overdue badge for past dates', () => {
  const html = renderCard(makeCard({ dueDate: '2026-11-01' }), NOW);
  assert.match(html, /Write release notes/);
  assert.match(html, /Asha/);
  assert.match(html, /badge-overdue/);
});

test('a card with a far due date shows the date instead of a warning', () => {
  const html = renderCard(makeCard({ dueDate: '2026-12-25' }), NOW);
  assert.match(html, /Dec 25/);
  assert.doesNotMatch(html, /badge-overdue|badge-soon/);
});

test('assignee names are escaped', () => {
  const html = renderCard(makeCard({ assignee: '<i>Asha</i>' }), NOW);
  assert.doesNotMatch(html, /<i>Asha/);
});

test('a card without an assignee says Unassigned', () => {
  assert.match(renderCard(makeCard({ assignee: '' }), NOW), /Unassigned/);
});

test('the board renders every column with its count', () => {
  const html = renderBoard(defaultBoard(), NOW);
  assert.match(html, /To do/);
  assert.match(html, /In progress/);
  assert.match(html, /<span class="column-count" aria-label="2 cards">2<\/span>/);
});

test('the form links labels and shows errors accessibly', () => {
  const html = renderNewCardForm({ values: { title: '' }, errors: { title: 'Title is required.' } });
  assert.match(html, /<label for="card-title">/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /role="alert">Title is required\./);
});
