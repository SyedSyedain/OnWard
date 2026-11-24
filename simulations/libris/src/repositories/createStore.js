/**
 * In-memory storage shared by the services. Each call returns a fresh,
 * independent store, so tests never see each other's data.
 */

export function createStore({ books = [], copies = [], members = [] } = {}) {
  const store = {
    books: new Map(books.map((b) => [b.id, { ...b }])),
    copies: new Map(copies.map((c) => [c.id, { ...c }])),
    members: new Map(members.map((m) => [m.id, { ...m }])),
    loans: new Map(),
    holds: new Map(),
    counters: { loan: 0, hold: 0, copy: 0 },
  };

  /** Returns the next id for a collection, e.g. nextId('loan') -> 'loan-1'. */
  store.nextId = (kind) => {
    store.counters[kind] += 1;
    return `${kind}-${store.counters[kind]}`;
  };

  return store;
}
