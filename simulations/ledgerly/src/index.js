/**
 * Wires the Ledgerly services together.
 */

import { createStore } from './repositories/createStore.js';
import { createActivityService } from './services/activityService.js';
import { createGroupService } from './services/groupService.js';
import { createBalanceService } from './services/balanceService.js';
import { createExpenseService } from './services/expenseService.js';
import { createSettlementService } from './services/settlementService.js';

/**
 * Builds a fresh Ledgerly instance with its own in-memory store.
 * @param {{ clock?: () => string }} [options]
 */
export function createLedgerly(options = {}) {
  const store = createStore(options);
  const activityService = createActivityService(store);
  const groupService = createGroupService(store, activityService);
  const balanceService = createBalanceService(groupService);
  const expenseService = createExpenseService(store, groupService, balanceService, activityService);
  const settlementService = createSettlementService(store, groupService, balanceService, activityService);
  return { store, activityService, groupService, balanceService, expenseService, settlementService };
}
