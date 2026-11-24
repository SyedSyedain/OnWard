/**
 * Verified Work Records: a signed summary of what a student did.
 * The HMAC signature proves the record was issued by this server and
 * has not been edited since.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config/env.js';
import { AppError } from '../lib/AppError.js';
import { recordsCollection } from '../store/index.js';
import { createId } from '../utils/ids.js';

export function issueRecord(details) {
  const payload = { id: createId('rec'), issuedAt: new Date().toISOString(), ...details };
  return recordsCollection.save({ ...payload, signature: sign(payload) });
}

export function getVerifiedRecord(recordId) {
  const stored = recordsCollection.get(recordId);
  if (!stored) {
    throw AppError.notFound('This work record does not exist.', 'RECORD_NOT_FOUND');
  }

  return { record: stored, verified: isAuthentic(stored) };
}

/**
 * Brings back a record the server lost (the free host wipes its disk on restart), from a copy the
 * student's browser or the shared link kept. Only a copy whose signature still matches is stored again;
 * an edited copy is shown as unverified and never saved.
 */
export function restoreRecord(copy) {
  const stored = recordsCollection.get(copy.id);
  if (stored) return { record: stored, verified: isAuthentic(stored) };
  if (!isAuthentic(copy)) return { record: copy, verified: false };
  return { record: recordsCollection.save(copy), verified: true };
}

/** True when the record's signature matches its contents. */
export function isAuthentic(record) {
  const { signature, ...payload } = record;
  return signaturesMatch(signature, sign(payload));
}

function sign(payload) {
  return createHmac('sha256', config.recordSecret).update(canonicalJson(payload)).digest('hex');
}

function signaturesMatch(a, b) {
  const left = Buffer.from(a ?? '', 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

/** JSON with sorted keys, so the same data always produces the same signature. */
export function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}
