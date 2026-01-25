import { signImages } from '@server/utils/signImages';

export interface HasImageUrl {
  imageUrl: string;
}

export async function assignSignedUrls<T extends HasImageUrl>(
  array: T[]
): Promise<T[]> {
  if (array.length === 0) {
    return array;
  }

  const imageUrls = array.map(recipe => recipe.imageUrl);
  const signedUrls = await signImages(imageUrls);

  for (const [index, recipe] of array.entries()) {
    recipe.imageUrl = signedUrls[index];
  }

  return array;
}
