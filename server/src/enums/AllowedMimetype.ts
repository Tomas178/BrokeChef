export enum AllowedMimeType {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
}

export const allowedMimetypesArray = Object.values(AllowedMimeType) as string[];

export type AllowedMimetypeValues = `${AllowedMimeType}`;
