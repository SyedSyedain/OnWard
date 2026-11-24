/**
 * Error types shared by every service.
 */

export class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

/** The input is missing or malformed. */
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

/** The requested record does not exist. */
export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

/** The action is not allowed in the current state. */
export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}
