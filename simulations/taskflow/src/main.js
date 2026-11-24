/**
 * Browser entry point: mounts the board and wires up events.
 */

import { createStore } from './store/createStore.js';
import { ADD_CARD, MOVE_CARD, SET_FILTER, UNDO, createInitialState, reducer } from './store/reducer.js';
import { selectAssignees } from './store/selectors.js';
import { validateCardInput } from './lib/validation.js';
import { getShortcutAction } from './lib/shortcuts.js';
import { renderBoard } from './components/board.js';
import { renderNewCardForm } from './components/newCardForm.js';

const root = document.getElementById('app');
const store = createStore(createInitialState(), reducer);
let formState = { values: {}, errors: {} };

function render() {
  const state = store.getState();
  root.innerHTML =
    renderNewCardForm({ ...formState, assignees: selectAssignees(state) }) + renderBoard(state, new Date());
}

root.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const values = Object.fromEntries(data.entries());
  const { valid, errors } = validateCardInput(values);
  formState = valid ? { values: {}, errors: {} } : { values, errors };
  if (valid) store.dispatch({ type: ADD_CARD, payload: values });
  else render();
});

root.addEventListener('change', (event) => {
  if (event.target.id === 'assignee-filter') {
    store.dispatch({ type: SET_FILTER, payload: { filter: event.target.value } });
  }
});

root.addEventListener('dragstart', (event) => {
  const card = event.target.closest('[data-card-id]');
  if (card) event.dataTransfer.setData('text/plain', card.dataset.cardId);
});
root.addEventListener('dragover', (event) => event.preventDefault());
root.addEventListener('drop', (event) => {
  const column = event.target.closest('[data-column-id]');
  const cardId = event.dataTransfer.getData('text/plain');
  if (column && cardId) {
    store.dispatch({ type: MOVE_CARD, payload: { cardId, toColumnId: column.dataset.columnId } });
  }
});

document.addEventListener('keydown', (event) => {
  const action = getShortcutAction(event);
  if (action === 'new-card') {
    event.preventDefault();
    document.getElementById('card-title')?.focus();
  } else if (action === 'focus-filter') {
    event.preventDefault();
    document.getElementById('assignee-filter')?.focus();
  } else if (action === 'undo') {
    event.preventDefault();
    store.dispatch({ type: UNDO });
  }
});

store.subscribe(render);
render();
