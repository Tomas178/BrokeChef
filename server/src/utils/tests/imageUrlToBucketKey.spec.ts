import { imageUrlToBucketKey } from '../imageUrlToBucketKey';

it('Should return a key that is not a full url', () => {
  const fakeUrl =
    'https://<bucket-name>.s3.<region>.amazonaws.com/folder/image';

  const key = imageUrlToBucketKey(fakeUrl);

  expect(key).toBe('folder/image');
});
