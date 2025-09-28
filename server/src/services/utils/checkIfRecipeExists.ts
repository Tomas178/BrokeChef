import type { RecipesRepository } from '@server/repositories/recipesRepository';

export async function checkIfRecipeExists(
  recipesRepository: RecipesRepository,
  recipeId: number
): Promise<boolean> {
  const recipeById = await recipesRepository.findById(recipeId);

  return recipeById ? true : false;
}
