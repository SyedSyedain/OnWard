/**
 * In-memory storage shared by the services.
 */

/**
 * @param {{drivers?: object[], promos?: object[]}} [initial]
 */
export function createStore({ drivers = [], promos = [] } = {}) {
  const counters = {};
  return {
    drivers: new Map(drivers.map((d) => [d.id, { ...d, location: { ...d.location } }])),
    promos: new Map(promos.map((p) => [p.code, { ...p }])),
    rides: new Map(),
    redemptions: [],
    nextId(prefix) {
      counters[prefix] = (counters[prefix] ?? 0) + 1;
      return `${prefix}-${counters[prefix]}`;
    },
  };
}
