/**
 * Builds a fresh, isolated Ledgerly instance for each test.
 */

import { createLedgerly } from '../src/index.js';

/** Creates an app whose clock ticks one minute per call (deterministic). */
export function createTestApp() {
  let tick = 0;
  const clock = () => new Date(Date.UTC(2026, 0, 1, 0, tick++)).toISOString();
  return createLedgerly({ clock });
}

/**
 * Creates a group with Asha, Bala and Chitra.
 * @returns {{ app: ReturnType<typeof createTestApp>, groupId: string, asha: string, bala: string, chitra: string }}
 */
export function createTestGroup(names = ['Asha', 'Bala', 'Chitra']) {
  const app = createTestApp();
  const group = app.groupService.createGroup({ name: 'Goa Trip', members: names });
  const [asha, bala, chitra] = group.members.map((m) => m.id);
  return { app, groupId: group.id, asha, bala, chitra };
}

/** Returns a balances lookup keyed by member id. */
export function balanceMap(app, groupId) {
  return Object.fromEntries(app.balanceService.getBalances(groupId).map((b) => [b.memberId, b.balanceInPaise]));
}
