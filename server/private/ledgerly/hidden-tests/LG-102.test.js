import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestGroup, balanceMap } from '../helpers.js';

test('[acceptance] the activity feed lists the most recent entry first', () => {
  const { app, groupId, asha } = createTestGroup();
  app.expenseService.addExpense(groupId, { description: 'Lunch', amountInPaise: 30000, paidBy: asha });
  app.expenseService.addExpense(groupId, { description: 'Taxi', amountInPaise: 12000, paidBy: asha });
  const feed = app.activityService.list(groupId);
  assert.equal(feed[0].message, 'Asha paid Rs 120.00 for Taxi');
  assert.equal(feed[1].message, 'Asha paid Rs 300.00 for Lunch');
});

test('[acceptance] the limit keeps the newest entries, not the oldest', () => {
  const { app, groupId, asha } = createTestGroup();
  app.expenseService.addExpense(groupId, { description: 'Lunch', amountInPaise: 30000, paidBy: asha });
  app.expenseService.addExpense(groupId, { description: 'Taxi', amountInPaise: 12000, paidBy: asha });
  const feed = app.activityService.list(groupId, { limit: 2 });
  assert.deepEqual(feed.map((e) => e.type), ['expense.added', 'expense.added']);
  assert.match(feed[0].message, /Taxi/);
  assert.match(feed[1].message, /Lunch/);
});

test('[acceptance] the feed still contains every entry for the group', () => {
  const { app, groupId, asha } = createTestGroup();
  app.expenseService.addExpense(groupId, { description: 'Lunch', amountInPaise: 30000, paidBy: asha });
  const feed = app.activityService.list(groupId);
  assert.equal(feed.length, 4);
  assert.ok(feed.every((e) => e.groupId === groupId));
});
