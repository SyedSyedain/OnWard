import * as recordService from '../services/record.service.js';

export function getRecord(req, res) {
  res.json(recordService.getVerifiedRecord(req.params.recordId));
}
