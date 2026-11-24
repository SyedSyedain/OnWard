/**
 * Entry point: wires the store and services together.
 */

import { createStore } from './repositories/createStore.js';
import { createCatalogueService } from './services/catalogueService.js';
import { createMemberService } from './services/memberService.js';
import { createHoldService } from './services/holdService.js';
import { createLoanService } from './services/loanService.js';

/**
 * Builds a library with its own in-memory store.
 * @param {Parameters<typeof createStore>[0]} [seed] initial books, copies and members
 */
export function createLibrary(seed) {
  const store = createStore(seed);
  const catalogue = createCatalogueService(store);
  const members = createMemberService(store);
  const holds = createHoldService(store, catalogue, members);
  const loans = createLoanService(store, { catalogue, members, holds });
  return { store, catalogue, members, holds, loans };
}
