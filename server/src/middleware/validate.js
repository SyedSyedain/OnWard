/**
 * Validates part of the request against a zod schema and stores the parsed
 * value on `req.valid`, so controllers only ever read clean data.
 */

import { AppError } from '../lib/AppError.js';

export function validate(source, schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const [firstIssue] = result.error.issues;
      const field = firstIssue.path.join('.');
      const message = field ? `${field}: ${firstIssue.message}` : firstIssue.message;
      return next(AppError.badRequest(message, 'VALIDATION_ERROR'));
    }

    req.valid = { ...req.valid, [source]: result.data };
    next();
  };
}
