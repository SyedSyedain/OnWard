/**
 * Validation for the new-card form.
 */

export const MAX_TITLE_LENGTH = 80;

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Checks the values of the new-card form.
 * @param {{ title?: string, assignee?: string, dueDate?: string }} input
 * @returns {{ valid: boolean, errors: { title?: string, dueDate?: string } }}
 */
export function validateCardInput(input) {
  const errors = {};
  const title = input.title ?? '';

  if (title.length === 0) {
    errors.title = 'Title is required.';
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (input.dueDate) {
    if (!DAY_PATTERN.test(input.dueDate) || Number.isNaN(new Date(input.dueDate).getTime())) {
      errors.dueDate = 'Enter a valid due date.';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
