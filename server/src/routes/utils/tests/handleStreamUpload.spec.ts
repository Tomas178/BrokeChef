import EventEmitter from 'node:events'; // Use EventEmitter for .on and .emit
import type { Request } from 'express';
import { ImageFolder } from '@server/enums/ImageFolder';
import { allowedMimetypesArray } from '@server/enums/AllowedMimetype';
import type { S3Client } from '@aws-sdk/client-s3';
import { handleStreamUpload } from '../handleStreamUpload';

const [
  mockFormUniqueFilename,
  mockUploadImageStream,
  mockLoggerInfo,
  mockLoggerError,
  mockCreateTransformStream,
  mockPipeline,
  mockBusboy,
] = vi.hoisted(() => [
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
]);

vi.mock('@server/utils/formUniqueFilename', () => ({
  formUniqueFilename: mockFormUniqueFilename,
}));

vi.mock('@server/utils/AWSS3Client/uploadImageStream', () => ({
  uploadImageStream: mockUploadImageStream,
}));

vi.mock('@server/logger', () => ({
  default: {
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}));

const mockTransformStream = vi.hoisted(() => ({
  _isMockStream: true,
  destroy: vi.fn(),
}));

vi.mock('@server/utils/createTransformStream', () => ({
  createTransformStream:
    mockCreateTransformStream.mockReturnValue(mockTransformStream),
}));

const mockFileSizeValidatorInstance = { _isMockValidator: true };
const mockFileSizeValidatorClass = vi.hoisted(() => vi.fn());

vi.mock('@server/routes/utils/FileSizeValidator', () => ({
  FileSizeValidator: mockFileSizeValidatorClass.mockImplementation(
    () => mockFileSizeValidatorInstance
  ),
}));

vi.mock('node:stream/promises', () => ({
  pipeline: mockPipeline,
}));

vi.mock('busboy', () => ({
  default: mockBusboy,
}));

const mockS3Client = vi.hoisted(() => ({})) as S3Client;
vi.mock('@server/utils/AWSS3Client/client', () => ({
  s3Client: mockS3Client,
}));

// Helper to simulate Busboy behavior
const createMockBusboy = () => {
  // eslint-disable-next-line unicorn/prefer-event-target
  const emitter = new EventEmitter() as any;
  // Explicitly mock the 'on' method while keeping the emitter functionality
  emitter.on = vi.fn(emitter.on);
  mockBusboy.mockReturnValue(emitter);
  return emitter;
};

const mockRequest = {
  headers: {},
  pipe: vi.fn().mockReturnThis(),
} as unknown as Request;

const mockFileStream = {
  resume: vi.fn(),
} as any;

const defaultFolder = ImageFolder.COLLECTIONS;
const fakeFilename = 'filename';
const fakeKey = `${defaultFolder}/${fakeFilename}`;

/**
 * Helper to find the 'file' event handler from the busboy mock calls
 */
const getFileHandler = (busboy: any) => {
  const call = busboy.on.mock.calls.find(
    (arguments_: [string, any]) => arguments_[0] === 'file'
  );
  if (!call) throw new Error('Busboy file handler not found');
  return call[1];
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFormUniqueFilename.mockReturnValue(fakeFilename);
});

describe('handleStreamUpload', () => {
  it('Should initialize the pipeline with FileStream -> Validator -> Transform', async () => {
    const busboy = createMockBusboy();
    const uploadPromise = handleStreamUpload(mockRequest, defaultFolder);

    const fileHandler = getFileHandler(busboy);
    await fileHandler('image', mockFileStream, { mimeType: 'image/jpeg' });

    busboy.emit('finish');
    await uploadPromise;

    expect(mockFileSizeValidatorClass).toHaveBeenCalledWith();
    expect(mockPipeline).toHaveBeenCalledWith(
      mockFileStream,
      mockFileSizeValidatorInstance,
      mockTransformStream
    );
  });

  it('Should call the uploadImageStream with correct params', async () => {
    const busboy = createMockBusboy();
    const uploadPromise = handleStreamUpload(mockRequest, defaultFolder);

    const fileHandler = getFileHandler(busboy);
    await fileHandler('image', mockFileStream, { mimeType: 'image/jpeg' });

    busboy.emit('finish');
    const key = await uploadPromise;

    expect(mockUploadImageStream).toHaveBeenCalledExactlyOnceWith(
      mockS3Client,
      key,
      mockTransformStream,
      expect.toBeOneOf(allowedMimetypesArray)
    );
  });

  it('Should log error, destroy stream, and rethrow if Upload fails', async () => {
    const busboy = createMockBusboy();
    const error = new Error('S3 Error');
    mockUploadImageStream.mockRejectedValueOnce(error);

    const uploadPromise = handleStreamUpload(mockRequest, defaultFolder);

    const fileHandler = getFileHandler(busboy);
    await fileHandler('image', mockFileStream, { mimeType: 'image/jpeg' });

    await expect(uploadPromise).rejects.toThrow(error);

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining('Upload failed')
    );
    expect(mockTransformStream.destroy).toHaveBeenCalled();
    expect(mockFileStream.resume).toHaveBeenCalled();
  });

  it('Should log error, destroy stream, and rethrow if Pipeline fails', async () => {
    const busboy = createMockBusboy();
    const error = new Error('File too large');
    mockPipeline.mockRejectedValueOnce(error);

    const uploadPromise = handleStreamUpload(mockRequest, defaultFolder);

    const fileHandler = getFileHandler(busboy);
    await fileHandler('image', mockFileStream, { mimeType: 'image/jpeg' });

    await expect(uploadPromise).rejects.toThrow(error);
    expect(mockTransformStream.destroy).toHaveBeenCalled();
  });

  it('Should handle the file uploading and return the key', async () => {
    const busboy = createMockBusboy();
    const uploadPromise = handleStreamUpload(mockRequest, defaultFolder);

    const fileHandler = getFileHandler(busboy);
    await fileHandler('image', mockFileStream, { mimeType: 'image/jpeg' });

    busboy.emit('finish');
    const key = await uploadPromise;

    expect(key).toBe(fakeKey);
  });
});
