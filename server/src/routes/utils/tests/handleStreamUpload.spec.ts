import { Readable } from 'node:stream';
import { ImageFolder } from '@server/enums/ImageFolder';
import type { S3Client } from '@aws-sdk/client-s3';
import { allowedMimetypesArray } from '@server/enums/AllowedMimetype';
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

const mockTransformStream = vi.hoisted(() => ({ _isMockStream: true }));
vi.mock('@server/utils/createTransformStream', () => ({
  createTransformStream:
    mockCreateTransformStream.mockReturnValue(mockTransformStream),
}));

vi.mock('node:stream/promises', () => ({
  pipeline: mockPipeline,
}));

const mockS3Client = vi.hoisted(() => ({})) as S3Client;
vi.mock('@server/utils/AWSS3Client/client', () => ({
  s3Client: mockS3Client,
}));

const mockFileBuffer = Buffer.from('fake image');
const defaultFolder = ImageFolder.COLLECTIONS;
const fakeFilename = 'filename';
const fakeKey = `${defaultFolder}/${fakeFilename}`;

beforeEach(() => {
  vi.clearAllMocks();
  mockFormUniqueFilename.mockReturnValue(fakeFilename);
});

describe('handleStreamUpload', () => {
  it('Should create a transform stream', async () => {
    await handleStreamUpload(mockFileBuffer, defaultFolder);

    expect(mockCreateTransformStream).toHaveBeenCalledOnce();
  });

  it('Should call uploadImageStream with correct params', async () => {
    await handleStreamUpload(mockFileBuffer, defaultFolder);

    expect(mockUploadImageStream).toHaveBeenCalledExactlyOnceWith(
      mockS3Client,
      fakeKey,
      mockTransformStream,
      expect.toBeOneOf(allowedMimetypesArray)
    );
  });

  it('Should pipeline the buffer through the transform stream', async () => {
    await handleStreamUpload(mockFileBuffer, defaultFolder);

    expect(mockPipeline).toHaveBeenCalledOnce();

    const [bufferStream, transformStream] = mockPipeline.mock.calls[0];

    expect(bufferStream).toBeInstanceOf(Readable);
    expect(transformStream).toBe(mockTransformStream);
  });

  it('Should wait for both pipeline and upload to complete', async () => {
    const pipelinePromise = Promise.resolve();
    const uploadPromise = Promise.resolve();

    mockPipeline.mockReturnValueOnce(pipelinePromise);
    mockUploadImageStream.mockReturnValueOnce(uploadPromise);

    await handleStreamUpload(mockFileBuffer, defaultFolder);

    expect(mockPipeline).toHaveBeenCalled();
    expect(mockUploadImageStream).toHaveBeenCalled();
  });

  it('Should return the S3 key', async () => {
    mockFormUniqueFilename.mockReturnValueOnce(fakeFilename);

    const key = await handleStreamUpload(mockFileBuffer, defaultFolder);

    expect(key).toBe(fakeKey);
  });

  it('Should log error and rethrow if pipeline fails', async () => {
    const error = new Error('Pipeline Error');
    mockPipeline.mockRejectedValueOnce(error);

    await expect(
      handleStreamUpload(mockFileBuffer, defaultFolder)
    ).rejects.toThrow(error);

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining('Upload to S3 failed')
    );
  });

  it('Should log error and rethrow if S3 upload fails', async () => {
    const error = new Error('S3 Error');
    mockUploadImageStream.mockRejectedValueOnce(error);

    await expect(
      handleStreamUpload(mockFileBuffer, defaultFolder)
    ).rejects.toThrow(error);

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining('Upload to S3 failed')
    );
  });

  it('Should log information about created S3 object', async () => {
    const key = await handleStreamUpload(mockFileBuffer, defaultFolder);

    expect(mockLoggerInfo).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(key)
    );
  });

  it('Should generate unique filename for each upload', async () => {
    await handleStreamUpload(mockFileBuffer, defaultFolder);

    expect(mockFormUniqueFilename).toHaveBeenCalledOnce();
  });
});
