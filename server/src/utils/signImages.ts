import { s3Client } from './AWSS3Client/client';
import { signGetUrl } from './AWSS3Client/signGetUrl';

export async function signImages<T extends string | string[]>(
  images: T
): Promise<T> {
  if (Array.isArray(images)) {
    const signedImages = await Promise.all(
      images.map(async image => await signGetUrl(s3Client, image))
    );

    return signedImages as T;
  } else {
    const image = await signGetUrl(s3Client, images);

    return image as T;
  }
}
