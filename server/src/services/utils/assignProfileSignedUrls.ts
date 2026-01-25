import type { UsersPublic } from '@server/entities/users';
import { signImages } from '@server/utils/signImages';
import { isOAuthProviderImage } from './isOAuthProviderImage';

export async function assignProfileSignedUrls(users: UsersPublic[]) {
  if (users.length === 0) {
    return users;
  }

  const imageUrls = users
    .filter(user => user.image && !isOAuthProviderImage(user.image))
    .map(user => user.image as string);

  if (imageUrls.length > 0) {
    const signedImageUrls = await signImages(imageUrls);

    for (const [, user] of users.entries()) {
      if (user.image && !isOAuthProviderImage(user.image)) {
        // eslint-disable-next-line unicorn/no-null
        user.image = signedImageUrls.shift() ?? null;
      }
    }
  }

  return users;
}
