import type { ObjectValues } from '@server/shared/types';

export const AllowedMimeType = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
} as const;

export const allowedMimetypesArray = Object.values(AllowedMimeType) as string[];

export type AllowedMimetypeValues = ObjectValues<typeof AllowedMimeType>;
