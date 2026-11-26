/**
 * Pure reducer for the Nestly app state.
 */

/**
 * @returns {{filters: object, stay: object, favourites: string[], selectedId: string|null, page: number}}
 */
export function createInitialState() {
  return {
    filters: { query: '', minPrice: null, maxPrice: null, guests: 1, amenities: [], sort: 'recommended' },
    stay: { checkIn: '', checkOut: '', guests: 1 },
    favourites: [],
    selectedId: null,
    page: 1,
  };
}

/**
 * Applies an action to the state and returns the next state.
 * @param {ReturnType<typeof createInitialState>} state
 * @param {{type: string, [key: string]: any}} action
 * @returns {ReturnType<typeof createInitialState>}
 */
export function reducer(state, action) {
  switch (action.type) {
    case 'filters/set':
      return { ...state, page: 1, filters: { ...state.filters, ...action.changes } };
    case 'stay/set':
      return { ...state, stay: { ...state.stay, ...action.changes } };
    case 'page/set':
      return { ...state, page: action.page };
    case 'listing/select':
      return { ...state, selectedId: action.id };
    case 'favourites/toggle': {
      const favourites = state.favourites.includes(action.id)
        ? state.favourites.filter((id) => id !== action.id)
        : [...state.favourites, action.id];
      return { ...state, favourites };
    }
    default:
      return state;
  }
}
