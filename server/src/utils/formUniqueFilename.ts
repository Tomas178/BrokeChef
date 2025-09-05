import { randomUUID } from 'node:crypto';

export function formUniqueFilename() {
  return randomUUID();
}
