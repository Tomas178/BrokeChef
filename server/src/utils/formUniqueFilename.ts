import { randomUUID } from 'node:crypto';

export function formUniqueFilename(filename: string) {
  return `${randomUUID()}-${filename}`;
}
