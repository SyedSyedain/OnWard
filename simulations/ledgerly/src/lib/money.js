/**
 * Helpers for dividing an amount in paise between members.
 * Every function returns a list of `{ memberId, amountInPaise }` entries.
 */

/**
 * Splits an amount equally between the given members.
 * @param {number} totalInPaise
 * @param {string[]} memberIds
 * @returns {{ memberId: string, amountInPaise: number }[]}
 */
export function splitEqually(totalInPaise, memberIds) {
  const each = Math.floor(totalInPaise / memberIds.length);
  return memberIds.map((memberId) => ({ memberId, amountInPaise: each }));
}

/**
 * Splits an amount in proportion to a weight per member. Leftover paise are
 * handed out one at a time in the order the members were given.
 * @param {number} totalInPaise
 * @param {Record<string, number>} shares Map of member id to a positive whole-number weight.
 * @returns {{ memberId: string, amountInPaise: number }[]}
 */
export function splitByShares(totalInPaise, shares) {
  const entries = Object.entries(shares);
  const totalShares = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const parts = entries.map(([memberId, weight]) => ({
    memberId,
    amountInPaise: Math.floor((totalInPaise * weight) / totalShares),
  }));
  let leftover = totalInPaise - parts.reduce((sum, part) => sum + part.amountInPaise, 0);
  for (let i = 0; leftover > 0; i = (i + 1) % parts.length) {
    parts[i].amountInPaise += 1;
    leftover -= 1;
  }
  return parts;
}

/**
 * Formats paise as a rupee string, e.g. 12550 -> "Rs 125.50".
 * @param {number} paise
 * @returns {string}
 */
export function formatRupees(paise) {
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  return `${sign}Rs ${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
