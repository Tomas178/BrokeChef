import type { createRecipeInput } from '@server/controllers/recipes/create';
import type { Database } from '@server/database';
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
import { assertPostgresError } from '@server/utils/errors';
import { PostgresError } from 'pg-error-enum';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import type { ToolsPublic } from '@server/entities/tools';
import type { IngredientsPublic } from '@server/entities/ingredients';
import type { RecipesPublic } from '@server/entities/recipes';
import { joinStepsToSingleString } from './utils/joinStepsToSingleString';

interface RecipesService {
  createRecipe: (
    recipe: createRecipeInput,
    userId: string
  ) => Promise<RecipesPublic | undefined>;
}

export function recipesService(database: Database): RecipesService {
  return {
    async createRecipe(recipe, userId) {
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
        } catch (error) {
          assertPostgresError(error);

          if (error.code === PostgresError.FOREIGN_KEY_VIOLATION) {
            throw new UserNotFound(userId);
          }
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
  const existingIngredients = await repo.findByNames(ingredients);
  const existingMap = new Map(
    existingIngredients.map(index => [index.name, index])
  );

  const newIngredients = ingredients.filter(
    ingredientName => !existingMap.has(ingredientName)
  );

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

async function insertTools(
  recipeId: number,
  tools: string[],
  repo: ToolsRepository,
  linkRepo: RecipesToolsRepository
): Promise<void> {
  if (tools.length === 0) return;

  const existingTools = await repo.findByNames(tools);
  const existingMap = new Map(existingTools.map(index => [index.name, index]));

  const newTools = tools.filter(toolName => !existingMap.has(toolName));

  let createdTools: ToolsPublic[] = [];
  if (newTools.length > 0) {
    const newInsertableToolsArray = newTools.map(name => ({ name }));

    createdTools = await repo.create(newInsertableToolsArray);
  }

  const allTools = [...existingTools, ...createdTools];

  const links = allTools.map(tool => ({ recipeId, toolId: tool.id }));

  await linkRepo.create(links);
}
