import type { IngredientsPublic } from '@server/entities/ingredients';
import type { ToolsPublic } from '@server/entities/tools';
import type { IngredientsRepository } from '@server/repositories/ingredientsRepository';
import type { RecipesIngredientsRepository } from '@server/repositories/recipesIngredientsRepository';
import type { RecipesToolsRepository } from '@server/repositories/recipesToolsRepository';
import type { ToolsRepository } from '@server/repositories/toolsRepository';

export async function insertIngredients(
  recipeId: number,
  ingredients: string[],
  repo: IngredientsRepository,
  linkRepo: RecipesIngredientsRepository
): Promise<void> {
  if (ingredients.length === 0) return;

  const existingIngredients = await repo.findByNames(ingredients);
  const existingIngredientsNames = new Set(
    existingIngredients.map(ingredient => ingredient.name)
  );

  const newIngredients = [
    ...new Set(ingredients.filter(name => !existingIngredientsNames.has(name))),
  ];

  let createdIngredients: IngredientsPublic[] = [];
  if (newIngredients.length > 0) {
    const newInsertableIngredientsArray = newIngredients.map(name => ({
      name,
    }));

    createdIngredients = await repo.create(newInsertableIngredientsArray);
  }
  const allIngredients = [...existingIngredients, ...createdIngredients];

  const links = allIngredients.map(ingredient => ({
    recipeId,
    ingredientId: ingredient.id,
  }));

  await linkRepo.create(links);
}

export async function insertTools(
  recipeId: number,
  tools: string[],
  repo: ToolsRepository,
  linkRepo: RecipesToolsRepository
): Promise<void> {
  if (tools.length === 0) return;

  const existingTools = await repo.findByNames(tools);
  const existingToolsNames = new Set(existingTools.map(tool => tool.name));

  const newTools = [
    ...new Set(tools.filter(name => !existingToolsNames.has(name))),
  ];

  let createdTools: ToolsPublic[] = [];
  if (newTools.length > 0) {
    const newInsertableToolsArray = newTools.map(name => ({ name }));

    createdTools = await repo.create(newInsertableToolsArray);
  }

  const allTools = [...existingTools, ...createdTools];

  const links = allTools.map(tool => ({ recipeId, toolId: tool.id }));

  await linkRepo.create(links);
}
