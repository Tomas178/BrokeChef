import { signImages } from '../signImages';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@server/utils/AWSS3Client/signGetUrl', () => ({
  signGetUrl: vi.fn(() => fakeImageUrl),
}));

const imageUrl = 'fake-url';

describe('signImages', () => {
  describe('Array case', () => {
    it('Should sign all of the image urls', async () => {
      const imageUrls = [imageUrl, imageUrl];

      const signedImageUrls = await signImages(imageUrls);

      const [signedImageOne, signedImageTwo] = signedImageUrls;

      expect(signedImageOne).toBe(fakeImageUrl);
      expect(signedImageTwo).toBe(fakeImageUrl);
    });

    it('Should not sign an empty url', async () => {
      const imageUrls = [imageUrl, imageUrl, ''];

      const signedImageUrls = await signImages(imageUrls);

      const [signedImageOne, signedImageTwo, signedImageThree] =
        signedImageUrls;

      expect(signedImageOne).toBe(fakeImageUrl);
      expect(signedImageTwo).toBe(fakeImageUrl);
      expect(signedImageThree).toBe('');
    });
  });

  describe('Single string case', () => {
    it('Should sign the image url', async () => {
      const signedImageUrl = await signImages(imageUrl);

      expect(signedImageUrl).toBe(fakeImageUrl);
    });

    it('Should not sign an empty url', async () => {
      const emptyString = '';

      const signedImageUrl = await signImages(emptyString);

      expect(signedImageUrl).toBe(emptyString);
    });
  });
});
