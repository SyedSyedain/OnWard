/**
 * In-memory storage shared by all services. Each call returns a fresh,
 * independent store.
 */

/**
 * @param {{ clock?: () => string }} [options] `clock` returns an ISO timestamp.
 */
export function createStore({ clock = () => new Date().toISOString() } = {}) {
  const counters = {};
  return {
    groups: new Map(),
    expenses: new Map(),
    settlements: [],
    activity: [],
    clock,
    /** Returns the next id for a prefix, e.g. nextId('g') -> "g-1". */
    nextId(prefix) {
      counters[prefix] = (counters[prefix] ?? 0) + 1;
      return `${prefix}-${counters[prefix]}`;
    },
  };
}
