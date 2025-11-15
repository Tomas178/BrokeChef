import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import type CannotMarkOwnRecipeAsCooked from '@server/utils/errors/recipes/CannotMarkOwnRecipeAsCooked';

export async function validateRecipeExists(
  recipesRepository: RecipesRepository,
  recipeId: number
) {
  const recipe = await recipesRepository.findById(recipeId);

  if (!recipe) {
    throw new RecipeNotFound();
  }

  return recipe;
}

export async function validateRecipeAndUserIsNotAuthor<
  T extends
    | CannotRateOwnRecipe
    | CannotSaveOwnRecipe
    | CannotMarkOwnRecipeAsCooked,
>(
  recipesRepository: RecipesRepository,
  recipeId: number,
  userId: string,
  ErrorClass: new () => T
) {
  const recipe = await validateRecipeExists(recipesRepository, recipeId);

  if (recipe.userId === userId) {
    throw new ErrorClass();
  }

  return recipe;
}
