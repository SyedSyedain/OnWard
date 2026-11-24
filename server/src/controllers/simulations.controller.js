import * as issueCatalog from '../services/issueCatalog.service.js';

/** The codebases students can be placed in, grouped by role on the client. No ticket details leave here. */
export function listSimulations(req, res) {
  res.json({ simulations: issueCatalog.listSimulations() });
}
