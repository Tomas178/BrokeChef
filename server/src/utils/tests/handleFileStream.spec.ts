/* eslint-disable unicorn/prefer-event-target */
import { EventEmitter } from 'node:stream';
import type { Request } from 'express';
import Busboy from 'busboy';
import { MAX_FILE_SIZE } from '@server/shared/consts';
import { handleFileStream } from '../handleFileStream';
import ImageTooLarge from '../errors/images/ImageTooLarge';
import WrongImageType from '../errors/images/WrongImageType';

vi.mock('busboy', () => ({
  default: vi.fn(() => new EventEmitter()),
}));

const mockReq = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  pipe: vi.fn().mockImplementation(destination => destination),
} as unknown as Request;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleFileStream', () => {
  it('Should construct Busboy with Request headers and limit file size', () => {
    handleFileStream(mockReq);

    expect(Busboy).toHaveBeenCalledExactlyOnceWith({
      headers: mockReq.headers,
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    });
  });

  it('Should resolve with file data when "file" event is emitted', async () => {
    const promise = handleFileStream(mockReq);
    const busboyInstance = vi.mocked(Busboy).mock.results[0].value;

    const mockFileStream = new EventEmitter();
    const info = { filename: 'test.jpg', mimeType: 'image/jpeg' };

    busboyInstance.emit('file', 'file', mockFileStream, info);

    const result = await promise;

    expect(result).toEqual({
      stream: mockFileStream,
      filename: 'test.jpg',
      mimetype: 'image/jpeg',
    });
  });

  it('Should reject with WrongImageType if mimetype is not an image', async () => {
    const promise = handleFileStream(mockReq);
    const busboyInstance = vi.mocked(Busboy).mock.results[0].value;

    const mockFileStream = { resume: vi.fn() };
    const info = { filename: 'test.txt', mimeType: 'text/plain' };

    busboyInstance.emit('file', 'file', mockFileStream, info);

    await expect(promise).rejects.toBeInstanceOf(WrongImageType);
    expect(mockFileStream.resume).toHaveBeenCalled();
  });

  it('Should reject with ImageTooLarge when fileStream emits "limit"', async () => {
    const promise = handleFileStream(mockReq);
    const busboyInstance = vi.mocked(Busboy).mock.results[0].value;

    const mockFileStream = new EventEmitter();
    const info = { filename: 'large.jpg', mimeType: 'image/jpeg' };

    busboyInstance.emit('file', 'file', mockFileStream, info);

    mockFileStream.emit('limit');

    await expect(promise).rejects.toBeInstanceOf(ImageTooLarge);
  });

  it('Should reject if Busboy encounters a general error', async () => {
    const promise = handleFileStream(mockReq);
    const busboyInstance = vi.mocked(Busboy).mock.results[0].value;

    const error = new Error('Busboy internal error');
    busboyInstance.emit('error', error);

    await expect(promise).rejects.toThrow('Busboy internal error');
  });

  it('Should pipe the request stream to the Busboy', async () => {
    handleFileStream(mockReq);

    const busboyInstance = vi.mocked(Busboy).mock.results[0].value;
    expect(mockReq.pipe).toHaveBeenCalledExactlyOnceWith(busboyInstance);
  });
});
