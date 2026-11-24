import { request } from './httpClient.js';

export const recordsApi = {
  get: (recordId) => request('GET', `/records/${encodeURIComponent(recordId)}`),
};
