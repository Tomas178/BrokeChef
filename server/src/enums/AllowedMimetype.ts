export enum ALLOWED_MIMETYPE {
  PNG = 'image/png',
  JPEG = 'images/jpeg',
}

export type AllowedMimetypeKeys =
  (typeof ALLOWED_MIMETYPE)[keyof typeof ALLOWED_MIMETYPE];
