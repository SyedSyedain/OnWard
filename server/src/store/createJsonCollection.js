/**
 * A tiny persistent collection backed by a JSON file.
 * It is intentionally simple: the whole collection lives in memory and is
 * written to disk (atomically) after every change. Swap this module for a
 * database adapter without touching the services.
 */

import fs from 'node:fs';
import path from 'node:path';

export function createJsonCollection(filePath) {
  const records = new Map(readExisting(filePath));

  function persist() {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const temporaryPath = `${filePath}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(Object.fromEntries(records), null, 2));
    fs.renameSync(temporaryPath, filePath);
  }

  return {
    get(id) {
      const record = records.get(id);
      return record ? structuredClone(record) : null;
    },
    save(record) {
      records.set(record.id, structuredClone(record));
      persist();
      return structuredClone(record);
    },
  };
}

function readExisting(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return Object.entries(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}
