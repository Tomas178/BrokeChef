import type { CreateRecipeInput } from '@server/controllers/recipes/create';
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
import { generateRecipeImage } from '@server/utils/GoogleGenAiClient/generateRecipeImage';
import { ai } from '@server/utils/GoogleGenAiClient/client';
import { uploadImage } from '@server/utils/AWSS3Client/uploadImage';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { ImageFolder } from '@server/enums/ImageFolder';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import { deleteFile } from '@server/utils/AWSS3Client/deleteFile';
import config from '@server/config';
import logger from '@server/logger';
import { joinStepsToSingleString } from './utils/joinStepsToSingleString';

interface RecipesService {
  createRecipe: (
    recipe: CreateRecipeInput,
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

        let imageUrl: string;

        if (recipeData.imageUrl) {
          imageUrl = recipeData.imageUrl; // user provided
        } else {
          const generatedImage = await generateRecipeImage(ai, {
            title: recipeData.title,
            ingredients,
          });

          imageUrl = await uploadImage(
            s3Client,
            ImageFolder.RECIPES,
            generatedImage,
            AllowedMimeType.JPEG
          );
        }

        const stepsAsSingleString = joinStepsToSingleString(recipeData.steps);

        const recipeToInsert = {
          ...recipeData,
          steps: stepsAsSingleString,
          userId,
          imageUrl,
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
          try {
            await deleteFile(
              s3Client,
              config.auth.aws.s3.buckets.images,
              recipeToInsert.imageUrl
            );
          } catch (S3Error) {
            logger.error('Failed to rollback S3 Object:', S3Error);
          }

          assertPostgresError(error);

          if (error.code === PostgresError.FOREIGN_KEY_VIOLATION) {
            throw new UserNotFound();
          }
        }
      });
    },
  };
}

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
