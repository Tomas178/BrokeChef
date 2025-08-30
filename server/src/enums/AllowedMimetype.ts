export enum ALLOWED_MIMETYPE {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
}

export type AllowedMimetypeKeys =
  (typeof ALLOWED_MIMETYPE)[keyof typeof ALLOWED_MIMETYPE];
