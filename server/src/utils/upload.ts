/* eslint-disable unicorn/no-null */
import multer from 'multer';
import { allowedMimetypesArray } from '@server/enums/AllowedMimetype';

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (request, file, callback) => {
    if (allowedMimetypesArray.includes(file.mimetype)) {
      callback(null, true);
    } else {
      request.fileValidationError =
        'Supported types for image are .png, .jpg or .jpeg';
      callback(null, false);
    }
  },
  limits: { files: 1, fileSize: 5 * 1024 * 1024 }, // 5MB
});
