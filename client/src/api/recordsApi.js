import { request } from './httpClient.js';

export const recordsApi = {
  get: (recordId) => request('GET', `/records/${encodeURIComponent(recordId)}`),
  /** Gives the server back a signed copy of a record it lost; it stores the copy only if the signature matches. */
  restore: (record) => request('POST', '/records/restore', { record }),
};
