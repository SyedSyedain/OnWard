/**
 * Splits a list into pages.
 */

/**
 * Returns one page of items plus the paging details needed by a pager.
 * @param {Array<unknown>} items
 * @param {number} page 1-based page number
 * @param {number} pageSize
 * @returns {{items: Array<unknown>, page: number, pageSize: number, totalItems: number, totalPages: number, hasPrev: boolean, hasNext: boolean}}
 */
export function paginate(items, page, pageSize) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    page,
    pageSize,
    totalItems,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}
