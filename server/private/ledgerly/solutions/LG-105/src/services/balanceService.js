/**
 * Member balances. A balance is positive when the group owes the member
 * money and negative when the member owes the group.
 */

/**
 * @param {ReturnType<import('./groupService.js').createGroupService>} groupService
 */
export function createBalanceService(groupService) {
  /**
   * Records an expense: the payer is credited the full amount and every
   * participant is debited their share.
   * @param {object} group Live group record.
   * @param {{ paidBy: string, amountInPaise: number, splits: { memberId: string, amountInPaise: number }[] }} expense
   */
  function applyExpense(group, expense) {
    group.balances[expense.paidBy] += expense.amountInPaise;
    for (const split of expense.splits) {
      group.balances[split.memberId] -= split.amountInPaise;
    }
  }

  /**
   * Undoes an expense recorded with applyExpense.
   * @param {object} group Live group record.
   * @param {{ paidBy: string, amountInPaise: number, splits: { memberId: string, amountInPaise: number }[] }} expense
   */
  function reverseExpense(group, expense) {
    group.balances[expense.paidBy] -= expense.amountInPaise;
    for (const split of expense.splits) {
      group.balances[split.memberId] += split.amountInPaise;
    }
  }

  /**
   * Moves money from one member to another (a settle-up payment).
   * The payer's balance goes up and the receiver's goes down.
   */
  function applyTransfer(group, fromId, toId, amountInPaise) {
    group.balances[fromId] += amountInPaise;
    group.balances[toId] -= amountInPaise;
  }

  /**
   * Lists every member's balance.
   * @param {string} groupId
   * @returns {{ memberId: string, name: string, balanceInPaise: number }[]}
   */
  function getBalances(groupId) {
    const group = groupService.requireGroup(groupId);
    return group.members.map((member) => ({
      memberId: member.id,
      name: member.name,
      balanceInPaise: group.balances[member.id],
    }));
  }

  /**
   * Suggests a short list of payments that would clear every balance.
   * @param {string} groupId
   * @returns {{ from: string, to: string, amountInPaise: number }[]}
   */
  function suggestSettlements(groupId) {
    const balances = getBalances(groupId).map((b) => ({ id: b.memberId, amount: b.balanceInPaise }));
    const debtors = balances.filter((b) => b.amount < 0).sort((a, b) => a.amount - b.amount);
    const creditors = balances.filter((b) => b.amount > 0).sort((a, b) => b.amount - a.amount);
    const payments = [];
    let d = 0;
    let c = 0;
    while (d < debtors.length && c < creditors.length) {
      const amount = Math.min(-debtors[d].amount, creditors[c].amount);
      payments.push({ from: debtors[d].id, to: creditors[c].id, amountInPaise: amount });
      debtors[d].amount += amount;
      creditors[c].amount -= amount;
      if (debtors[d].amount === 0) d += 1;
      if (creditors[c].amount === 0) c += 1;
    }
    return payments;
  }

  return { applyExpense, reverseExpense, applyTransfer, getBalances, suggestSettlements };
}
