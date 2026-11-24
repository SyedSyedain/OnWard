import { request } from './httpClient.js';

export const simulationsApi = {
  /** The codebases students can be placed in: { id, name, roleId, description, issueCount }. */
  list: () => request('GET', '/simulations'),
};
