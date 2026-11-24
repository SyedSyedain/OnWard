/**
 * Builds a fresh, isolated library for each test.
 */

import { createLibrary } from '../src/index.js';

export function defaultBooks() {
  return [
    { id: 'b-1', title: 'Introduction to Algorithms', author: 'Cormen', priceInPaise: 120000 },
    { id: 'b-2', title: 'The Pragmatic Programmer', author: 'Hunt', priceInPaise: 60000 },
    { id: 'b-3', title: 'Clean Code', author: 'Martin', priceInPaise: 50000 },
    { id: 'b-4', title: 'Refactoring', author: 'Fowler', priceInPaise: 70000 },
    { id: 'b-cheap', title: 'Pocket Poems', author: 'Anon', priceInPaise: 1000 },
  ];
}

/**
 * Creates a library with the default books, `copiesPerBook` copies of each
 * and three members: m-1 (limit 3), m-2 (limit 3) and m-3 (limit 2).
 */
export function createTestLibrary({ copiesPerBook = 1 } = {}) {
  const books = defaultBooks();
  const copies = [];
  for (const book of books) {
    for (let i = 1; i <= copiesPerBook; i += 1) {
      copies.push({ id: `${book.id}-c${i}`, bookId: book.id, status: 'available' });
    }
  }
  const members = [
    { id: 'm-1', name: 'Asha', type: 'student', borrowLimit: 3 },
    { id: 'm-2', name: 'Ravi', type: 'student', borrowLimit: 3 },
    { id: 'm-3', name: 'Meera', type: 'student', borrowLimit: 2 },
  ];
  return createLibrary({ books, copies, members });
}
