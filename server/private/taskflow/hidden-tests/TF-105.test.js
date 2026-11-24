import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOVE_CARD, UNDO, reducer } from '../../src/store/reducer.js';
import { defaultBoard } from '../helpers.js';

const ids = (state, columnId) => state.columns.find((c) => c.id === columnId).cardIds;

test('[acceptance] undo puts a moved card back in its original column and position', () => {
  const start = defaultBoard();
  const moved = reducer(start, { type: MOVE_CARD, payload: { cardId: 'c-1', toColumnId: 'done' } });
  const undone = reducer(moved, { type: UNDO });
  assert.deepEqual(ids(undone, 'todo'), ['c-1', 'c-2']);
  assert.deepEqual(ids(undone, 'done'), []);
});

test('[acceptance] moving a card does not modify the previous state', () => {
  const start = defaultBoard();
  reducer(start, { type: MOVE_CARD, payload: { cardId: 'c-1', toColumnId: 'done' } });
  assert.deepEqual(ids(start, 'todo'), ['c-1', 'c-2']);
  assert.deepEqual(ids(start, 'done'), []);
  assert.equal(start.history.length, 0);
});

test('[acceptance] moves and reorders within a board still work and can be undone one by one', () => {
  const start = defaultBoard();
  const one = reducer(start, { type: MOVE_CARD, payload: { cardId: 'c-2', toColumnId: 'todo', index: 0 } });
  assert.deepEqual(ids(one, 'todo'), ['c-2', 'c-1']);
  const two = reducer(one, { type: MOVE_CARD, payload: { cardId: 'c-3', toColumnId: 'done' } });
  assert.deepEqual(ids(two, 'doing'), []);
  assert.deepEqual(ids(two, 'done'), ['c-3']);
  const back = reducer(reducer(two, { type: UNDO }), { type: UNDO });
  assert.deepEqual(ids(back, 'todo'), ['c-1', 'c-2']);
  assert.deepEqual(ids(back, 'doing'), ['c-3']);
});
