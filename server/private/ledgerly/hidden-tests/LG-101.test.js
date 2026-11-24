import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestGroup, balanceMap } from '../helpers.js';
import { ValidationError } from '../../src/lib/errors.js';

test('[acceptance] an expense of zero paise is rejected', () => {
  const { app, groupId, asha } = createTestGroup();
  assert.throws(() => app.expenseService.addExpense(groupId, { description: 'Nothing', amountInPaise: 0, paidBy: asha }), ValidationError);
});

test('[acceptance] a rejected zero expense is not stored and does not change balances', () => {
  const { app, groupId, asha, bala, chitra } = createTestGroup();
  assert.throws(() => app.expenseService.addExpense(groupId, { description: 'Nothing', amountInPaise: 0, paidBy: asha }), ValidationError);
  assert.equal(app.expenseService.listExpenses(groupId).length, 0);
  assert.deepEqual(balanceMap(app, groupId), { [asha]: 0, [bala]: 0, [chitra]: 0 });
});

test('[acceptance] an expense of one paisa or more is still accepted', () => {
  const { app, groupId, asha } = createTestGroup(['Asha', 'Bala']);
  const expense = app.expenseService.addExpense(groupId, { description: 'Gum', amountInPaise: 2, paidBy: asha });
  assert.equal(expense.amountInPaise, 2);
  assert.equal(app.expenseService.listExpenses(groupId).length, 1);
});
