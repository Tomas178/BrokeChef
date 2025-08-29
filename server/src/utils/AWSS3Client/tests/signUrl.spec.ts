import type { S3Client } from '@aws-sdk/client-s3';
import { signUrl } from '../signUrl';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => 'https://signed-url.com/folder/image.png'),
}));

const mockS3Client = {} as S3Client;
const fakeKey = 'folder/image.png';

describe('signUrl', () => {
  it('Should sign url and return it', async () => {
    const signedUrl = await signUrl(mockS3Client, fakeKey);

    expect(signedUrl).toBe('https://signed-url.com/folder/image.png');
  });
});
