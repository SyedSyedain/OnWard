/**
 * A tiny observable store.
 */

/**
 * @template S
 * @param {S} initialState
 * @param {(state: S, action: object) => S} reducer
 * @returns {{ getState: () => S, dispatch: (action: object) => void, subscribe: (fn: (state: S) => void) => () => void }}
 */
export function createStore(initialState, reducer) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
