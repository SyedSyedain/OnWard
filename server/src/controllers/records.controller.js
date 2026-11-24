import * as recordService from '../services/record.service.js';

export function getRecord(req, res) {
  res.json(recordService.getVerifiedRecord(req.params.recordId));
}

export function restoreRecord(req, res) {
  res.json(recordService.restoreRecord(req.valid.body.record));
}
