import type { S3Client } from '@aws-sdk/client-s3';
import { deleteFile } from '../deleteFile';

const mockSend = vi.fn();

const mockS3Client = {
  send: mockSend,
} as unknown as S3Client;

const bucket = 'test-bucket';
const key = 'path/to/file';

describe('deleteFile', () => {
  beforeEach(() => mockSend.mockReset());

  it('Should delete file', async () => {
    mockSend.mockResolvedValueOnce({});

    await deleteFile(mockS3Client, bucket, key);

    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { Bucket: bucket, Key: key },
      })
    );
  });

  it('Error', async () => {
    const error = new Error('S3 Failure');

    mockSend.mockRejectedValueOnce(error);

    await expect(deleteFile(mockS3Client, bucket, key)).rejects.toThrow(
      /failed/i
    );
  });
});
