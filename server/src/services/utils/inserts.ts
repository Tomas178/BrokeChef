import type {
  IngredientsName,
  IngredientsPublic,
} from '@server/entities/ingredients';
import type { ToolsName, ToolsPublic } from '@server/entities/tools';
import type { IngredientsRepository } from '@server/repositories/ingredientsRepository';
import type {
  RecipesIngredientsLink,
  RecipesIngredientsRepository,
} from '@server/repositories/recipesIngredientsRepository';
import type {
  RecipesToolsLink,
  RecipesToolsRepository,
} from '@server/repositories/recipesToolsRepository';
import type { ToolsRepository } from '@server/repositories/toolsRepository';

export async function insertIngredients(
  recipeId: number,
  ingredients: IngredientsName[],
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
  const allIngredients = [...createdIngredients, ...existingIngredients];

  const links: RecipesIngredientsLink[] = allIngredients.map(ingredient => ({
    recipeId,
    ingredientId: ingredient.id,
  }));

  await linkRepo.create(links);
}

export async function insertTools(
  recipeId: number,
  tools: ToolsName[],
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

  const allTools = [...createdTools, ...existingTools];

  const links: RecipesToolsLink[] = allTools.map(tool => ({
    recipeId,
    toolId: tool.id,
  }));

  await linkRepo.create(links);
}
