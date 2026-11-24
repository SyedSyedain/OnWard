import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestLibrary } from './helpers.js';
import { ValidationError, NotFoundError } from '../src/lib/errors.js';

test('addBook stores a trimmed book and rejects duplicates', () => {
  const { catalogue } = createTestLibrary();
  const book = catalogue.addBook({ id: 'b-9', title: '  Dune ', author: 'Herbert', priceInPaise: 30000 });
  assert.equal(book.title, 'Dune');
  assert.throws(() => catalogue.addBook({ id: 'b-9', title: 'Dune', author: 'Herbert', priceInPaise: 30000 }), ValidationError);
});

test('addBook rejects a missing title and a non-positive price', () => {
  const { catalogue } = createTestLibrary();
  assert.throws(() => catalogue.addBook({ id: 'b-9', title: '', author: 'X', priceInPaise: 100 }), ValidationError);
  assert.throws(() => catalogue.addBook({ id: 'b-9', title: 'T', author: 'X', priceInPaise: 0 }), ValidationError);
});

test('getBook throws NotFoundError for an unknown book', () => {
  const { catalogue } = createTestLibrary();
  assert.throws(() => catalogue.getBook('nope'), NotFoundError);
});

test('copies are counted as available until they are borrowed', () => {
  const { catalogue, loans } = createTestLibrary({ copiesPerBook: 2 });
  assert.equal(catalogue.countAvailable('b-1'), 2);
  loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.equal(catalogue.countAvailable('b-1'), 1);
});

test('search matches title or author, case-insensitively, with availability', () => {
  const { catalogue } = createTestLibrary();
  const byTitle = catalogue.search('pragmatic');
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].id, 'b-2');
  assert.equal(byTitle[0].availableCopies, 1);
  assert.equal(catalogue.search('FOWLER')[0].id, 'b-4');
  assert.equal(catalogue.search('').length, 5);
});

test('registerMember applies the default limit for the member type', () => {
  const { members } = createTestLibrary();
  assert.equal(members.registerMember({ id: 'm-f', name: 'Prof', type: 'faculty' }).borrowLimit, 6);
  assert.throws(() => members.registerMember({ id: 'm-x', name: 'X', type: 'alien' }), ValidationError);
});
