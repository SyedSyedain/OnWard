import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestGroup } from './helpers.js';

test('every kind of change is recorded in the activity feed', () => {
  const { app, groupId, asha, bala } = createTestGroup();
  const expense = app.expenseService.addExpense(groupId, { description: 'Dinner', amountInPaise: 90000, paidBy: asha });
  app.settlementService.settleUp(groupId, { from: bala, to: asha, amountInPaise: 1000 });
  app.expenseService.deleteExpense(groupId, expense.id);
  const types = app.activityService.list(groupId).map((e) => e.type);
  assert.equal(types.filter((t) => t === 'member.added').length, 3);
  assert.ok(types.includes('expense.added'));
  assert.ok(types.includes('settlement.recorded'));
  assert.ok(types.includes('expense.deleted'));
});

test('activity messages name the people involved', () => {
  const { app, groupId, asha } = createTestGroup();
  app.expenseService.addExpense(groupId, { description: 'Dinner', amountInPaise: 90050, paidBy: asha });
  const messages = app.activityService.list(groupId).map((e) => e.message);
  assert.ok(messages.includes('Asha paid Rs 900.50 for Dinner'));
});

test('the limit option caps the number of entries', () => {
  const { app, groupId } = createTestGroup();
  assert.equal(app.activityService.list(groupId, { limit: 2 }).length, 2);
});

test('the feed only contains the requested group', () => {
  const { app, groupId } = createTestGroup();
  const other = app.groupService.createGroup({ name: 'Flat', members: ['Esha'] });
  assert.equal(app.activityService.list(other.id).length, 1);
  assert.ok(app.activityService.list(groupId).every((e) => e.groupId === groupId));
});
