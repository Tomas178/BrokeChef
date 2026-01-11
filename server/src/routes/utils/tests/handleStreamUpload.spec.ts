import { Readable } from 'node:stream';
import { ImageFolder } from '@server/enums/ImageFolder';
import type { S3Client } from '@aws-sdk/client-s3';
import { allowedMimetypesArray } from '@server/enums/AllowedMimetype';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { handleStreamUpload } from '../handleStreamUpload';

const [
  mockFormUniqueFilename,
  mockUploadImageStream,
  mockLoggerInfo,
  mockLoggerError,
  mockCreateTransformStream,
  mockPipeline,
  mockDone,
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

const mockTransformStream = vi.hoisted(() => ({ _isMockStream: true }));
vi.mock('@server/utils/createTransformStream', () => ({
  createTransformStream: mockCreateTransformStream,
}));

vi.mock('node:stream/promises', () => ({
  pipeline: mockPipeline,
}));

const mockS3Client = vi.hoisted(() => ({})) as S3Client;
vi.mock('@server/utils/AWSS3Client/client', () => ({
  s3Client: mockS3Client,
}));

const defaultFolder = ImageFolder.COLLECTIONS;
const fakeFilename = 'filename';
const fakeKey = `${defaultFolder}/${fakeFilename}`;

const createMockFileStream = () => Readable.from([Buffer.from('chunk')]);

describe('handleStreamUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFormUniqueFilename.mockReturnValue(fakeFilename);
    mockCreateTransformStream.mockReturnValue(mockTransformStream);
    mockPipeline.mockResolvedValue(undefined);
    mockDone.mockResolvedValue({});

    mockUploadImageStream.mockReturnValue({
      done: mockDone,
    });
  });

  it('Should create a transform stream', async () => {
    await handleStreamUpload(createMockFileStream(), defaultFolder);
    expect(mockCreateTransformStream).toHaveBeenCalledOnce();
  });

  it('Should call uploadImageStream with correct params', async () => {
    await handleStreamUpload(createMockFileStream(), defaultFolder);

    expect(mockUploadImageStream).toHaveBeenCalledWith(
      mockS3Client,
      fakeKey,
      mockTransformStream,
      expect.toBeOneOf(allowedMimetypesArray)
    );
  });

  it('Should pipeline the buffer through the transform stream', async () => {
    await handleStreamUpload(createMockFileStream(), defaultFolder);

    expect(mockPipeline).toHaveBeenCalledOnce();
    const [bufferStream, transformStream] = mockPipeline.mock.calls[0];

    expect(bufferStream).toBeInstanceOf(Readable);
    expect(transformStream).toBe(mockTransformStream);
  });

  it('Should wait for both pipeline and upload.done() to complete', async () => {
    await handleStreamUpload(createMockFileStream(), defaultFolder);

    expect(mockPipeline).toHaveBeenCalled();
    expect(mockDone).toHaveBeenCalled();
  });

  it('Should return the S3 key', async () => {
    const key = await handleStreamUpload(createMockFileStream(), defaultFolder);
    expect(key).toBe(fakeKey);
  });

  it('Should log error and rethrow if pipeline fails', async () => {
    const error = new Error('Pipeline Error');
    mockPipeline.mockRejectedValueOnce(error);

    await expect(
      handleStreamUpload(createMockFileStream(), defaultFolder)
    ).rejects.toThrow(error);

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining(`Upload to S3 failed: ${fakeKey}`)
    );
  });

  it('Should log error and rethrow if upload.done() fails', async () => {
    const error = new Error('S3 Error');
    mockDone.mockRejectedValueOnce(error);

    await expect(
      handleStreamUpload(createMockFileStream(), defaultFolder)
    ).rejects.toThrow(error);

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining(`Upload to S3 failed: ${fakeKey}`)
    );
  });

  it('Should log information about created S3 object', async () => {
    await handleStreamUpload(createMockFileStream(), defaultFolder);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      expect.stringContaining(fakeKey)
    );
  });
});
