/**
 * A minimal state container.
 * @module state/store
 */

/**
 * Creates a store holding `initial` and updating it through `reducer`.
 * @template S
 * @param {S} initial
 * @param {(state: S, action: object) => S} reducer
 */
export function createStore(initial, reducer) {
  let state = initial;
  const listeners = new Set();

  return {
    /** @returns {S} */
    getState: () => state,
    /** Runs an action through the reducer and notifies subscribers if the state changed. */
    dispatch(action) {
      const next = reducer(state, action);
      if (next === state) return state;
      state = next;
      listeners.forEach((listener) => listener(state));
      return state;
    },
    /** @returns {() => void} an unsubscribe function */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
