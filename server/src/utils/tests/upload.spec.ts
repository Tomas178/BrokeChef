import type { Request } from 'express';
import { upload } from '../upload';

describe('upload', () => {
  const multerOptions = upload;
  const fileFilter = (multerOptions as any).fileFilter;

  it('Should not allow any other file mimetype other than PNG or JPEG', () => {
    const request = {} as Request;
    const file = { mimetype: 'application/pdf' } as Express.Multer.File;
    const mockCallback = vi.fn();

    fileFilter(request, file, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null, false);
    expect(request.fileValidationError).toMatch(/.png|.jpg|.jpeg/i);
  });

  it('Should allow PNG format', () => {
    const request = {} as Request;
    const file = { mimetype: 'image/png' } as Express.Multer.File;
    const mockCallback = vi.fn();

    fileFilter(request, file, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null, true);
    expect(request.fileValidationError).toBeUndefined();
  });

  it('Should allow JPEG format', () => {
    const request = {} as Request;
    const file = { mimetype: 'image/jpeg' } as Express.Multer.File;
    const mockCallback = vi.fn();

    fileFilter(request, file, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null, true);
    expect(request.fileValidationError).toBeUndefined();
  });
});
