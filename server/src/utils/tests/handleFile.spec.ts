/* eslint-disable unicorn/prevent-abbreviations */
import { MulterError } from 'multer';
import { handleFile } from '../handleFile';
import ImageTooLarge from '../errors/images/ImageTooLarge';
import WrongImageType from '../errors/images/WrongImageType';

const mockUploadSingle = vi.fn();

vi.mock('@server/utils/upload', () => ({
  upload: {
    single: (_field: string) => mockUploadSingle,
  },
}));

describe('handleFile', () => {
  const request = {} as any;
  const requestWithUser = { user: { id: '123' } } as any;

  it('Should throw ImageTooLarge if MulterError LIMIT_FILE_SIZE is thrown', async () => {
    mockUploadSingle.mockImplementationOnce((_request, _res, callback) => {
      callback(new MulterError('LIMIT_FILE_SIZE'));
    });

    await expect(handleFile(request)).rejects.toThrowError(ImageTooLarge);
  });

  it('Should rethrow WrongImageType', async () => {
    mockUploadSingle.mockImplementationOnce((_request, _res, callback) => {
      callback(new WrongImageType());
    });

    await expect(handleFile(request)).rejects.toThrowError(WrongImageType);
  });

  it('Should rethrow any other error', async () => {
    mockUploadSingle.mockImplementationOnce((_request, _res, callback) => {
      callback(new Error('smth'));
    });

    await expect(handleFile(request)).rejects.toThrowError(Error);
  });

  it('Should throw WrongImageType if no file is attached', async () => {
    mockUploadSingle.mockImplementationOnce((request_, _res, callback) => {
      request_.file = undefined;
      callback(null);
    });

    await expect(handleFile(request)).rejects.toThrowError(WrongImageType);
  });

  it('Should log with user ID when MulterError was thrown', async () => {
    mockUploadSingle.mockImplementationOnce((_req, _res, callback) => {
      callback(new MulterError('LIMIT_FILE_SIZE'));
    });

    await expect(handleFile(requestWithUser)).rejects.toThrowError(
      ImageTooLarge
    );
  });

  it('Should log with user ID when WrongImageType was thrown', async () => {
    mockUploadSingle.mockImplementationOnce((_req, _res, callback) => {
      callback(new WrongImageType());
    });

    await expect(handleFile(requestWithUser)).rejects.toThrowError(
      WrongImageType
    );
  });

  it('Should resolve with the file if upload is successful', async () => {
    const file = { filename: 'test.jpg' } as Express.Multer.File;

    mockUploadSingle.mockImplementationOnce((request_, _res, callback) => {
      request_.file = file;
      callback(null);
    });

    await expect(handleFile(request)).resolves.toEqual(file);
  });
});
