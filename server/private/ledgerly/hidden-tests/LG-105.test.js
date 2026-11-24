import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestGroup, balanceMap } from '../helpers.js';
import { NotFoundError } from '../../src/lib/errors.js';

test('[acceptance] deleting an expense reverses its effect on every balance', () => {
  const { app, groupId, asha, bala, chitra } = createTestGroup();
  const expense = app.expenseService.addExpense(groupId, { description: 'Dinner', amountInPaise: 90000, paidBy: asha });
  app.expenseService.deleteExpense(groupId, expense.id);
  assert.deepEqual(balanceMap(app, groupId), { [asha]: 0, [bala]: 0, [chitra]: 0 });
});

test('[acceptance] deleting one expense leaves the other expenses counted', () => {
  const { app, groupId, asha, bala, chitra } = createTestGroup();
  const dinner = app.expenseService.addExpense(groupId, { description: 'Dinner', amountInPaise: 90000, paidBy: asha });
  app.expenseService.addExpense(groupId, {
    description: 'Taxi',
    amountInPaise: 20000,
    paidBy: bala,
    split: { type: 'equal', participants: [asha, bala] },
  });
  app.expenseService.deleteExpense(groupId, dinner.id);
  assert.deepEqual(balanceMap(app, groupId), { [asha]: -10000, [bala]: 10000, [chitra]: 0 });
});

test('[acceptance] deleting an unknown or already deleted expense fails without touching balances', () => {
  const { app, groupId, asha, bala, chitra } = createTestGroup();
  const expense = app.expenseService.addExpense(groupId, { description: 'Dinner', amountInPaise: 90000, paidBy: asha });
  assert.throws(() => app.expenseService.deleteExpense(groupId, 'e-404'), NotFoundError);
  assert.deepEqual(balanceMap(app, groupId), { [asha]: 60000, [bala]: -30000, [chitra]: -30000 });
  assert.equal(app.expenseService.listExpenses(groupId).length, 1);
  assert.equal(expense.id, app.expenseService.listExpenses(groupId)[0].id);
});
