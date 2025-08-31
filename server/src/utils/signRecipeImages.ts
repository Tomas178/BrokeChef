import type {
  RecipesPublic,
  RecipesPublicAllInfo,
} from '@server/entities/recipes';
import { s3Client } from './AWSS3Client/client';
import { signUrl } from './AWSS3Client/signUrl';

export async function signRecipeImage(
  recipes: RecipesPublic[] | RecipesPublicAllInfo
): Promise<void> {
  if (Array.isArray(recipes)) {
    await Promise.all(
      recipes.map(async recipe => {
        recipe.imageUrl = await signUrl(s3Client, recipe.imageUrl);
      })
    );
  } else {
    recipes.imageUrl = await signUrl(s3Client, recipes.imageUrl);
  }
}
