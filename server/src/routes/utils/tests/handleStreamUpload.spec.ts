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
  mockCreateFileSizeValidator,
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

const mockTransformStream = vi.hoisted(() => ({ _isMockStream: true }));
vi.mock('@server/utils/createTransformStream', () => ({
  createTransformStream:
    mockCreateTransformStream.mockReturnValue(mockTransformStream),
}));

const mockValidatorFunction = vi.hoisted(() => vi.fn());
vi.mock('@server/routes/utils/createFileSizeValidator', () => ({
  createFileSizeValidator: mockCreateFileSizeValidator.mockReturnValue(
    mockValidatorFunction
  ),
}));

const mockS3Client = vi.hoisted(() => ({})) as S3Client;
vi.mock('@server/utils/AWSS3Client/client', () => ({
  s3Client: mockS3Client,
}));

const mockRequest = {
  pipe: vi.fn(),
  on: vi.fn(),
  resume: vi.fn(),
  removeListener: vi.fn(),
} as unknown as Request;

const defaultFolder = ImageFolder.COLLECTIONS;
const fakeFilename = 'filename';

const fakeKey = `${defaultFolder}/${fakeFilename}`;

beforeEach(() => vi.clearAllMocks());

describe('handleStreamUpload', () => {
  it('Should attach the file size validator', async () => {
    await handleStreamUpload(mockRequest, defaultFolder);

    expect(mockCreateFileSizeValidator).toHaveBeenCalledWith(
      mockRequest,
      mockTransformStream
    );

    expect(mockRequest.on).toHaveBeenCalledWith('data', mockValidatorFunction);
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

  it('Should log error and rethrow if upload fails', async () => {
    const error = new Error('S3 Error');
    mockUploadImageStream.mockRejectedValueOnce(error);

    await expect(
      handleStreamUpload(mockRequest, defaultFolder)
    ).rejects.toThrow(error);

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining('Upload failed')
    );

    expect(mockRequest.removeListener).toHaveBeenCalledWith(
      'data',
      mockValidatorFunction
    );
  });

  it('Should handle the file uploading and return the key', async () => {
    mockFormUniqueFilename.mockReturnValueOnce(fakeFilename);

    const key = await handleStreamUpload(mockRequest, defaultFolder);

    expect(key).toBe(fakeKey);
  });
});
