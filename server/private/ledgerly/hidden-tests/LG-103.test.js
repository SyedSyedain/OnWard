import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestGroup, balanceMap } from '../helpers.js';

test('[acceptance] 100 paise split between three members adds up to exactly 100', () => {
  const { app, groupId, asha } = createTestGroup();
  const expense = app.expenseService.addExpense(groupId, { description: 'Chai', amountInPaise: 100, paidBy: asha });
  assert.equal(expense.splits.reduce((sum, s) => sum + s.amountInPaise, 0), 100);
});

test('[acceptance] shares differ by at most one paisa and balances net to zero', () => {
  const { app, groupId, asha } = createTestGroup();
  const expense = app.expenseService.addExpense(groupId, { description: 'Chai', amountInPaise: 101, paidBy: asha });
  const amounts = expense.splits.map((s) => s.amountInPaise);
  assert.ok(Math.max(...amounts) - Math.min(...amounts) <= 1);
  const total = Object.values(balanceMap(app, groupId)).reduce((sum, b) => sum + b, 0);
  assert.equal(total, 0);
});

test('[acceptance] an amount that divides evenly is still split evenly', () => {
  const { app, groupId, asha } = createTestGroup();
  const expense = app.expenseService.addExpense(groupId, { description: 'Dinner', amountInPaise: 90000, paidBy: asha });
  assert.deepEqual(expense.splits.map((s) => s.amountInPaise), [30000, 30000, 30000]);
});
