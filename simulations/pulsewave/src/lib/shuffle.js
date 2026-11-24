/**
 * Shuffling for the play queue.
 * @module lib/shuffle
 */

/**
 * Returns a shuffled copy of a list using the Fisher-Yates algorithm.
 * @template T
 * @param {T[]} items
 * @param {() => number} [random] returns a number in [0, 1); injectable for tests
 * @returns {T[]}
 */
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
