import type { S3Client } from '@aws-sdk/client-s3';
import { getTemplate } from '../getTemplate';

const mockSend = vi.fn();

const mockS3Client = {
  send: mockSend,
} as unknown as S3Client;

const bucket = 'test-bucket';
const key = 'verifyEmail.html';
const htmlContent = '<p>Hello {{username}}, verify at {{url}}</p>';

const mockTransformToString = vi.fn(() => htmlContent);

describe('getTemplates', () => {
  beforeEach(() => mockSend.mockReset());

  it('Should return template content', async () => {
    mockSend.mockResolvedValueOnce({
      Body: {
        transformToString: mockTransformToString,
      },
    });

    const result = await getTemplate(mockS3Client, bucket, key);

    expect(result).toBe(htmlContent);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { Bucket: bucket, Key: key },
      })
    );
  });

  it('Should throw an error if file is not found', async () => {
    mockSend.mockResolvedValueOnce({ Body: undefined });

    await expect(getTemplate(mockS3Client, bucket, key)).rejects.toThrow(
      /not found/i
    );
  });
});
