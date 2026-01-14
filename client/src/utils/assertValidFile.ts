import { allowedMimetypesArray } from '@server/enums/AllowedMimetype';
import { MAX_FILE_SIZE } from '@server/shared/consts';

export function assertValidFile(file: File) {
  if (!allowedMimetypesArray.includes(file.type)) {
    throw new Error('Supported types for image are .png, .jpg or .jpeg');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `Image too large please upload image <= ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
    );
  }
}
