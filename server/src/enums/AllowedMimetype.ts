export enum ALLOWED_MIMETYPE {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
}

export const AllowedMimetypesArray = Object.values(
  ALLOWED_MIMETYPE
) as string[];

export type AllowedMimetypeKeys =
  (typeof ALLOWED_MIMETYPE)[keyof typeof ALLOWED_MIMETYPE];
