import { randomBytes } from 'node:crypto';

/** Creates a short, URL-safe identifier such as "ses_k3j9x2m1q8". */
export function createId(prefix) {
  return `${prefix}_${randomBytes(6).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}
