/**
 * A tiny observable store.
 */

/**
 * @template S
 * @param {S} initialState
 * @param {(state: S, action: {type: string}) => S} reducer
 * @returns {{getState: () => S, dispatch: (action: {type: string}) => void, subscribe: (fn: (state: S) => void) => () => void}}
 */
export function createStore(initialState, reducer) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    dispatch(action) {
      const next = reducer(state, action);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
