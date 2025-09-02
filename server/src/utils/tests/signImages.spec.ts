import { signImages } from '../signImages';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@server/utils/AWSS3Client/signGetUrl', () => ({
  signGetUrl: vi.fn(() => fakeImageUrl),
}));

describe('signImages', () => {
  it('Should sign all of the image urls inside the array of strings', async () => {
    const imageUrls = ['fake-url-1', 'fake-url-2'];

    const signedImageUrls = await signImages(imageUrls);

    const [signedImageOne, signedImageTwo] = signedImageUrls;

    expect(signedImageOne).toBe(fakeImageUrl);
    expect(signedImageTwo).toBe(fakeImageUrl);
  });

  it('Should sign the image url of when given single string', async () => {
    const imageUrl = 'fake-url';

    const signedImageUrl = await signImages(imageUrl);

    expect(signedImageUrl).toBe(fakeImageUrl);
  });
});
