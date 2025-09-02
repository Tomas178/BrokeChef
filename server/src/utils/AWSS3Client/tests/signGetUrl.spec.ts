import type { S3Client } from '@aws-sdk/client-s3';
import { signGetUrl } from '../signGetUrl';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => 'https://signed-url.com/folder/image.png'),
}));

const mockS3Client = {} as S3Client;
const fakeKey = 'folder/image.png';

describe('signGetUrl', () => {
  it('Should sign url and return it', async () => {
    const signedUrl = await signGetUrl(mockS3Client, fakeKey);

    expect(signedUrl).toBe('https://signed-url.com/folder/image.png');
  });
});
