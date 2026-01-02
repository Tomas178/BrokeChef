import type { CreateRecipeInput } from '@server/shared/types';

export function formatRecipeForEmbedding(
  recipe: Omit<CreateRecipeInput, 'steps'>
) {
  return `Title: ${recipe.title}, duration: ${recipe.duration}, ingredients: ${recipe.ingredients.join(', ')}, tools: ${recipe.tools.join(', ')}`;
}
