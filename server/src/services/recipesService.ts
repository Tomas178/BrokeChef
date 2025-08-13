import type { createRecipeInput } from '@server/controllers/recipes/create';
import type { Database } from '@server/database';
import type { RecipesPublic } from '@server/entities/recipes';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import {
  ingredientsRepository as buildIngredientsRepository,
  type IngredientsRepository,
} from '@server/repositories/ingredientsRepository';
import {
  recipesIngredientsRepository as buildRecipesIngredientsRepository,
  type RecipesIngredientsRepository,
} from '@server/repositories/recipesIngredientsRepository';
import {
  toolsRepository as buildToolsRepository,
  type ToolsRepository,
} from '@server/repositories/toolsRepository';
import {
  recipesToolsRepository as buildRecipesToolsRepository,
  type RecipesToolsRepository,
} from '@server/repositories/recipesToolsRepository';
import { joinStepsToSingleString } from './utils/joinStepsToSingleString';

export function recipesService(database: Database) {
  return {
    async createRecipe(
      recipe: createRecipeInput,
      userId: string
    ): Promise<RecipesPublic> {
      return await database.transaction().execute(async trx => {
        const recipesRepository = buildRecipesRepository(trx);
        const ingredientsRepository = buildIngredientsRepository(trx);
        const recipesIngredientsRepository =
          buildRecipesIngredientsRepository(trx);
        const toolsRepository = buildToolsRepository(trx);
        const recipesToolsRepository = buildRecipesToolsRepository(trx);

        const { ingredients, tools, ...recipeData } = recipe;

        const stepsAsSingleString = joinStepsToSingleString(recipeData.steps);

        const recipeToInsert = {
          ...recipeData,
          steps: stepsAsSingleString,
          userId,
        };

        try {
          const createdRecipe = await recipesRepository.create(recipeToInsert);
          const recipeId = createdRecipe.id;

          await Promise.all([
            insertIngredients(
              recipeId,
              ingredients,
              ingredientsRepository,
              recipesIngredientsRepository
            ),

            insertTools(
              recipeId,
              tools,
              toolsRepository,
              recipesToolsRepository
            ),
          ]);

          return createdRecipe;
        } catch {
          throw new Error('Failed to create recipe');
        }
      });
    },
  };
}

async function insertIngredients(
  recipeId: number,
  ingredients: string[],
  repo: IngredientsRepository,
  linkRepo: RecipesIngredientsRepository
): Promise<void> {
  for (const ingredient of ingredients) {
    const existing = await repo.findByName(ingredient);

    const ingredientRecord =
      existing ?? (await repo.create({ name: ingredient }));

    await linkRepo.create({ recipeId, ingredientId: ingredientRecord.id });
  }
}

async function insertTools(
  recipeId: number,
  tools: string[],
  repo: ToolsRepository,
  linkRepo: RecipesToolsRepository
): Promise<void> {
  for (const tool of tools) {
    const existing = await repo.findByName(tool);

    const toolRecord = existing ?? (await repo.create({ name: tool }));

    await linkRepo.create({ recipeId, toolId: toolRecord.id });
  }
}
