import { isOAuthProviderImage } from '../isOAuthProviderImage';

describe('Should return false', () => {
  it('When provided imageUrl is null', () => {
    expect(isOAuthProviderImage(null)).toBeFalsy();
  });

  it('When image is from S3', () => {
    const imageUrl = 'https://s3Image.com';

    expect(isOAuthProviderImage(imageUrl)).toBeFalsy();
  });
});

describe('Should return true', () => {
  it('When image is from Google', async () => {
    const imageUrl = 'http://googleusercontent/123456/image.com';

    expect(isOAuthProviderImage(imageUrl)).toBeTruthy();
  });

  it('When image is from GitHub', async () => {
    const imageUrl = 'http://githubusercontent/123456/image.com';

    expect(isOAuthProviderImage(imageUrl)).toBeTruthy();
  });
});
