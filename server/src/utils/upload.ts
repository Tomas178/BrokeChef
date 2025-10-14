/* eslint-disable unicorn/no-null */
import multer from 'multer';
import { allowedMimetypesArray } from '@server/enums/AllowedMimetype';
import WrongImageType from './errors/images/WrongImageType';

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (request, file, callback) => {
    if (allowedMimetypesArray.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new WrongImageType());
    }
  },
  limits: { files: 1, fileSize: 5 * 1024 * 1024 }, // 1 file only and max 5MB
});
