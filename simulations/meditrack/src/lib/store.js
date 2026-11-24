/**
 * A very small state container.
 */

/**
 * Creates a store around a reducer.
 * @param {(state: object, action: object) => object} reducer
 * @param {object} initialState
 */
export function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    /** @returns {object} the current state */
    getState: () => state,
    /** Runs the reducer and notifies subscribers when the state changed. */
    dispatch(action) {
      const next = reducer(state, action);
      if (next !== state) {
        state = next;
        listeners.forEach((listener) => listener(state));
      }
      return state;
    },
    /** @returns {() => void} an unsubscribe function */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
