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
] = vi.hoisted(() => [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()]);

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

const mockS3Client = vi.hoisted(() => ({})) as S3Client;
vi.mock('@server/utils/AWSS3Client/client', () => ({
  s3Client: mockS3Client,
}));

const mockRequest = {} as Request;

const defaultFolder = ImageFolder.COLLECTIONS;
const fakeFilename = 'filename';

const fakeKey = `${defaultFolder}/${fakeFilename}`;

beforeEach(() => vi.clearAllMocks());

describe('handleStreamUpload', () => {
  it('Should initialize the pipeline with Request -> Validator -> Transform', async () => {
    await handleStreamUpload(mockRequest, defaultFolder);

    expect(mockFileSizeValidatorClass).toHaveBeenCalledWith();

    expect(mockPipeline).toHaveBeenCalledWith(
      mockRequest,
      mockFileSizeValidatorInstance,
      mockTransformStream
    );
  });

  it('Should call the uploadImageStream with correct params', async () => {
    const key = await handleStreamUpload(mockRequest, defaultFolder);

    expect(mockUploadImageStream).toHaveBeenCalledExactlyOnceWith(
      mockS3Client,
      key,
      mockTransformStream,
      expect.toBeOneOf(allowedMimetypesArray)
    );
  });

  it('Should log information about created S3 object', async () => {
    const key = await handleStreamUpload(mockRequest, defaultFolder);

    expect(mockLoggerInfo).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(key)
    );
  });

  it('Should log error, destroy stream, and rethrow if Upload fails', async () => {
    const error = new Error('S3 Error');
    mockUploadImageStream.mockRejectedValueOnce(error);

    await expect(
      handleStreamUpload(mockRequest, defaultFolder)
    ).rejects.toThrow(error);

    // Verify Error Log
    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining('Upload failed')
    );

    // Verify cleanup (crucial fix)
    expect(mockTransformStream.destroy).toHaveBeenCalled();
  });

  it('Should log error, destroy stream, and rethrow if Pipeline fails', async () => {
    // Simulate an error in the pipeline (e.g. file too big)
    const error = new Error('File too large');
    mockPipeline.mockRejectedValueOnce(error);

    await expect(
      handleStreamUpload(mockRequest, defaultFolder)
    ).rejects.toThrow(error);

    expect(mockTransformStream.destroy).toHaveBeenCalled();
  });

  it('Should handle the file uploading and return the key', async () => {
    mockFormUniqueFilename.mockReturnValueOnce(fakeFilename);

    const key = await handleStreamUpload(mockRequest, defaultFolder);

    expect(key).toBe(fakeKey);
  });
});
