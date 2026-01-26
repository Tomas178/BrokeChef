/* eslint-disable unicorn/no-null */
import multer from 'multer';
import { allowedMimetypesArray } from '@server/enums/AllowedMimetype';
import { MAX_FILE_SIZE } from '@server/shared/consts';
import WrongImageType from './errors/images/WrongImageType';

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_, file, callback) => {
    if (allowedMimetypesArray.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new WrongImageType());
    }
  },
  limits: { files: 1, fileSize: MAX_FILE_SIZE },
});
