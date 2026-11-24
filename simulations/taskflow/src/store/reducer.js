/**
 * Pure reducer for the board. Never modify the state passed in.
 */

export const ALL = 'all';
export const UNASSIGNED = 'unassigned';

export const ADD_CARD = 'card/add';
export const MOVE_CARD = 'card/move';
export const ARCHIVE_CARD = 'card/archive';
export const SET_FILTER = 'filter/set';
export const UNDO = 'history/undo';

/**
 * @returns {object} an empty board with the default columns
 */
export function createInitialState() {
  return {
    columns: [
      { id: 'todo', title: 'To do', cardIds: [] },
      { id: 'doing', title: 'In progress', cardIds: [] },
      { id: 'done', title: 'Done', cardIds: [] },
    ],
    cards: {},
    filter: ALL,
    history: [],
    nextId: 1,
  };
}

function removeCard(columns, cardId) {
  for (const column of columns) {
    const index = column.cardIds.indexOf(cardId);
    if (index !== -1) {
      column.cardIds.splice(index, 1);
      return;
    }
  }
}

function insertCard(columns, columnId, cardId, index) {
  const column = columns.find((c) => c.id === columnId);
  const position = index ?? column.cardIds.length;
  column.cardIds.splice(position, 0, cardId);
}

/**
 * Moves a card to a column (optionally at a position) and records an undo step.
 * @param {object} state
 * @param {{ cardId: string, toColumnId: string, index?: number }} payload
 * @returns {object}
 */
export function moveCard(state, { cardId, toColumnId, index }) {
  const columns = [...state.columns];
  removeCard(columns, cardId);
  insertCard(columns, toColumnId, cardId, index);
  return { ...state, columns, history: [...state.history, state.columns] };
}

/**
 * @param {object} state
 * @param {{ type: string }} action
 * @returns {object}
 */
export function reducer(state, action) {
  switch (action.type) {
    case ADD_CARD: {
      const { title, assignee = '', dueDate = '', columnId = 'todo' } = action.payload;
      const id = `c-${state.nextId}`;
      const card = { id, title: title.trim(), assignee, dueDate, archived: false };
      return {
        ...state,
        cards: { ...state.cards, [id]: card },
        columns: state.columns.map((column) =>
          column.id === columnId ? { ...column, cardIds: [...column.cardIds, id] } : column,
        ),
        nextId: state.nextId + 1,
      };
    }
    case MOVE_CARD:
      return moveCard(state, action.payload);
    case ARCHIVE_CARD: {
      const card = state.cards[action.payload.cardId];
      if (!card) return state;
      return { ...state, cards: { ...state.cards, [card.id]: { ...card, archived: true } } };
    }
    case SET_FILTER:
      return { ...state, filter: action.payload.filter };
    case UNDO: {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      return { ...state, columns: previous, history: state.history.slice(0, -1) };
    }
    default:
      return state;
  }
}
