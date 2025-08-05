import type { createRecipeInput } from '@server/controllers/recipes/create';
import type { Database } from '@server/database';
import type { RecipesPublic } from '@server/entities/recipes';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { ingredientsRepository as buildIngredientsRepository } from '@server/repositories/ingredientsRepository';
import { recipesIngredientsRepository as buildRecipesIngredientsRepository } from '@server/repositories/recipesIngredientsRepository';
import { toolsRepository as buildToolsRepository } from '@server/repositories/toolsRepository';
import { recipesToolsRepository as buildRecipesToolsRepository } from '@server/repositories/recipesToolsRepository';
import { joinStepsToSingleString } from './utils/joinStepsToSingleString';

export function recipesService(database: Database) {
  const recipesRepository = buildRecipesRepository(database);
  const ingredientsRepository = buildIngredientsRepository(database);
  const recipesIngredientsRepository =
    buildRecipesIngredientsRepository(database);
  const toolsRepository = buildToolsRepository(database);
  const recipesToolsRepository = buildRecipesToolsRepository(database);

  return {
    async createRecipe(
      recipe: createRecipeInput,
      userId: string
    ): Promise<RecipesPublic> {
      const { ingredients, tools, ...recipeData } = recipe;

      const stepsAsSingleString = joinStepsToSingleString(recipeData.steps);

      const recipeToInsert = {
        ...recipeData,
        steps: stepsAsSingleString,
        userId,
      };

      const createdRecipe = await recipesRepository.create(recipeToInsert);
      const recipeId = createdRecipe.id;

      for (const ingredient of ingredients) {
        const existing = await ingredientsRepository.findByName(ingredient);

        const ingredientRecord =
          existing ??
          (await ingredientsRepository.create({ name: ingredient }));

        await recipesIngredientsRepository.create({
          recipeId,
          ingredientId: ingredientRecord.id,
        });
      }

      for (const tool of tools) {
        const existing = await toolsRepository.findByName(tool);

        const toolRecord =
          existing ?? (await toolsRepository.create({ name: tool }));

        await recipesToolsRepository.create({
          recipeId,
          toolId: toolRecord.id,
        });
      }

      return createdRecipe;
    },
  };
}
