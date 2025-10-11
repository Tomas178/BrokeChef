export type ImageData = {
  filePath: string;
  mimeType: string;
};

export const PROFILE_IMAGE_DATA: ImageData = {
  filePath: './assets/test-image.png',
  mimeType: 'image/png',
};

export const TEXT_PATTERNS = {
  UPLOAD: /upload|add|create|insert/i,
  CREATED_UPDATED: /(creat|updat)ed/i,
  LOADING: /(chang|load|creat|updat)ing/i,
  CREDENTIALS: /change|credentials/i,
  SAVED: /saved|success/i,
  UNSAVED: /unsaved|success/i,
  CREATED: /created/i,
  REMOVED: /(delet|remov)ed/i,
  EXPLORE: /explore/i,
  CREATE: /create/i,
  INCORRECT_IMAGE_TYPE: /supported|types|format/i,
} as const;
