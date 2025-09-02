import type { S3Client } from '@aws-sdk/client-s3';
import { signPutUrl } from '../signPutUrl';

const fakeSignedUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => fakeSignedUrl),
}));

const mockS3Client = {} as S3Client;
const fakeKey = 'folder/image.png';

describe('signPutUrl', () => {
  it('Should sign url and return it', async () => {
    const signedUrl = await signPutUrl(mockS3Client, fakeKey);

    expect(signedUrl).toBe(fakeSignedUrl);
  });
});
