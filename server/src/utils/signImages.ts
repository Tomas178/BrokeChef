import { s3Client } from './AWSS3Client/client';
import { signUrl } from './AWSS3Client/signUrl';

export async function signImages<T extends string | string[]>(
  images: T
): Promise<T> {
  if (Array.isArray(images)) {
    const signedImages = await Promise.all(
      images.map(async image => await signUrl(s3Client, image))
    );

    return signedImages as T;
  } else {
    const image = await signUrl(s3Client, images);

    return image as T;
  }
}
