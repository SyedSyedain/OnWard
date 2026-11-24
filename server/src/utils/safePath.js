/**
 * Resolves a user-supplied relative path inside a base directory.
 * Throws if the path would escape the base directory.
 */

import path from 'node:path';
import { AppError } from '../lib/AppError.js';

export function resolveInside(baseDirectory, relativePath) {
  if (typeof relativePath !== 'string' || relativePath.length === 0) {
    throw AppError.badRequest('A file path is required.', 'INVALID_PATH');
  }

  const base = path.resolve(baseDirectory);
  const target = path.resolve(base, relativePath);

  if (target !== base && !target.startsWith(base + path.sep)) {
    throw AppError.badRequest('The file path is outside the workspace.', 'INVALID_PATH');
  }

  return target;
}
