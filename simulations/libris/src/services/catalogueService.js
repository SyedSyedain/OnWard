/**
 * Catalogue: books and their physical copies.
 */

import { NotFoundError, ValidationError } from '../lib/errors.js';

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 */
export function createCatalogueService(store) {
  /** Adds a book to the catalogue. Prices are in paise. */
  function addBook({ id, title, author, priceInPaise }) {
    if (typeof id !== 'string' || id.trim() === '') throw new ValidationError('Book id is required');
    if (typeof title !== 'string' || title.trim() === '') throw new ValidationError('Title is required');
    if (typeof author !== 'string' || author.trim() === '') throw new ValidationError('Author is required');
    if (!Number.isInteger(priceInPaise) || priceInPaise <= 0) {
      throw new ValidationError('Price must be a positive whole number of paise');
    }
    if (store.books.has(id)) throw new ValidationError(`Book ${id} already exists`);
    const book = { id, title: title.trim(), author: author.trim(), priceInPaise };
    store.books.set(id, book);
    return { ...book };
  }

  /** Returns a book or throws NotFoundError. */
  function getBook(bookId) {
    const book = store.books.get(bookId);
    if (!book) throw new NotFoundError(`Book ${bookId} not found`);
    return { ...book };
  }

  /** Registers a new physical copy of a book. New copies start on the shelf. */
  function addCopy(bookId) {
    getBook(bookId);
    const copy = { id: store.nextId('copy'), bookId, status: 'available' };
    store.copies.set(copy.id, copy);
    return { ...copy };
  }

  /** Returns every copy of a book. */
  function listCopies(bookId) {
    getBook(bookId);
    return [...store.copies.values()].filter((c) => c.bookId === bookId).map((c) => ({ ...c }));
  }

  /** Returns how many copies of a book are on the shelf and ready to borrow. */
  function countAvailable(bookId) {
    return listCopies(bookId).filter((c) => c.status === 'available').length;
  }

  /** Case-insensitive search over title and author. */
  function search(query) {
    const q = String(query ?? '').trim().toLowerCase();
    return [...store.books.values()]
      .filter((b) => q === '' || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((b) => ({ ...b, availableCopies: countAvailable(b.id) }));
  }

  return { addBook, getBook, addCopy, listCopies, countAvailable, search };
}
