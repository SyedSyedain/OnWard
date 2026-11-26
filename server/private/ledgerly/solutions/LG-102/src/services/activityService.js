/**
 * The activity feed shown on a group's home screen.
 */

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 */
export function createActivityService(store) {
  /**
   * Appends an entry to the feed.
   * @param {string} groupId
   * @param {string} type e.g. "expense.added"
   * @param {string} message Human-readable summary.
   */
  function record(groupId, type, message) {
    const entry = {
      id: store.nextId('a'),
      seq: store.activity.length + 1,
      groupId,
      type,
      message,
      at: store.clock(),
    };
    store.activity.push(entry);
    return entry;
  }

  /**
   * Lists a group's activity, most recent first.
   * @param {string} groupId
   * @param {{ limit?: number }} [options]
   */
  function list(groupId, { limit = 50 } = {}) {
    return store.activity
      .filter((entry) => entry.groupId === groupId)
      .reverse()
      .slice(0, limit);
  }

  return { record, list };
}
