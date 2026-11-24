import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/store/createStore.js';
import { ARCHIVE_CARD, MOVE_CARD, SET_FILTER, UNASSIGNED, UNDO, reducer } from '../src/store/reducer.js';
import { selectAssignees, selectColumnViews, selectVisibleCards } from '../src/store/selectors.js';
import { defaultBoard, makeBoard } from './helpers.js';

test('adding cards appends them to the chosen column with trimmed titles', () => {
  const state = makeBoard([{ title: '  Plan sprint  ', assignee: 'Asha', columnId: 'doing' }]);
  assert.deepEqual(state.columns.find((c) => c.id === 'doing').cardIds, ['c-1']);
  assert.equal(state.cards['c-1'].title, 'Plan sprint');
});

test('moving a card puts it in the destination column', () => {
  const state = reducer(defaultBoard(), { type: MOVE_CARD, payload: { cardId: 'c-1', toColumnId: 'done' } });
  const ids = (id) => state.columns.find((c) => c.id === id).cardIds;
  assert.deepEqual(ids('todo'), ['c-2']);
  assert.deepEqual(ids('done'), ['c-1']);
});

test('undo with no history leaves the state alone', () => {
  const state = defaultBoard();
  assert.equal(reducer(state, { type: UNDO }), state);
});

test('column counts ignore archived cards', () => {
  const state = reducer(defaultBoard(), { type: ARCHIVE_CARD, payload: { cardId: 'c-1' } });
  const counts = selectColumnViews(state).map((c) => c.count);
  assert.deepEqual(counts, [1, 1, 0]);
});

test('filtering by a name shows only that person cards', () => {
  const state = reducer(defaultBoard(), { type: SET_FILTER, payload: { filter: 'Asha' } });
  assert.deepEqual(selectVisibleCards(state, 'todo').map((c) => c.id), ['c-1']);
  assert.deepEqual(selectColumnViews(state).map((c) => c.count), [1, 1, 0]);
});

test('unassigned filter shows cards without an owner', () => {
  const base = makeBoard([{ title: 'Orphan' }, { title: 'Owned', assignee: 'Ben' }]);
  const state = reducer(base, { type: SET_FILTER, payload: { filter: UNASSIGNED } });
  assert.deepEqual(selectVisibleCards(state, 'todo').map((c) => c.title), ['Orphan']);
});

test('assignee list is sorted and unique', () => {
  assert.deepEqual(selectAssignees(defaultBoard()), ['Asha', 'Ben']);
});

test('the store notifies subscribers after dispatch', () => {
  const store = createStore(defaultBoard(), reducer);
  const seen = [];
  const unsubscribe = store.subscribe((s) => seen.push(s.filter));
  store.dispatch({ type: SET_FILTER, payload: { filter: 'Ben' } });
  unsubscribe();
  store.dispatch({ type: SET_FILTER, payload: { filter: 'Asha' } });
  assert.deepEqual(seen, ['Ben']);
});
