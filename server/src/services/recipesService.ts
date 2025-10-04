import type { CreateRecipeInput } from '@server/controllers/recipes/create';
import type { Database } from '@server/database';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { ingredientsRepository as buildIngredientsRepository } from '@server/repositories/ingredientsRepository';
import { recipesIngredientsRepository as buildRecipesIngredientsRepository } from '@server/repositories/recipesIngredientsRepository';
import { toolsRepository as buildToolsRepository } from '@server/repositories/toolsRepository';
import { ratingsService as buildRatingsService } from '@server/services/ratingsService';
import { recipesToolsRepository as buildRecipesToolsRepository } from '@server/repositories/recipesToolsRepository';
import { assertPostgresError } from '@server/utils/errors';
import { PostgresError } from 'pg-error-enum';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import type {
  RecipesPublic,
  RecipesPublicAllInfo,
} from '@server/entities/recipes';
import { generateRecipeImage } from '@server/utils/GoogleGenAiClient/generateRecipeImage';
import { ai } from '@server/utils/GoogleGenAiClient/client';
import { uploadImage } from '@server/utils/AWSS3Client/uploadImage';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { ImageFolder } from '@server/enums/ImageFolder';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import { deleteFile } from '@server/utils/AWSS3Client/deleteFile';
import config from '@server/config';
import logger from '@server/logger';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { signImages } from '@server/utils/signImages';
import type { Pagination } from '@server/shared/pagination';
import { joinStepsToSingleString } from './utils/joinStepsToSingleString';
import { insertIngredients, insertTools } from './utils/inserts';

export interface RecipesService {
  createRecipe: (
    recipe: CreateRecipeInput,
    userId: string
  ) => Promise<RecipesPublic | undefined>;
  findById: (recipeId: number) => Promise<RecipesPublicAllInfo | undefined>;
  findAll: (pagination: Pagination) => Promise<RecipesPublic[]>;
}

export function recipesService(database: Database): RecipesService {
  const recipesRepository = buildRecipesRepository(database);
  const ratingsService = buildRatingsService(database);

  return {
    async createRecipe(recipe, userId) {
      return await database.transaction().execute(async tx => {
        const recipesRepositoryForTx = buildRecipesRepository(tx);
        const ingredientsRepositoryForTx = buildIngredientsRepository(tx);
        const recipesIngredientsRepositoryForTx =
          buildRecipesIngredientsRepository(tx);
        const toolsRepositoryForTx = buildToolsRepository(tx);
        const recipesToolsRepositoryForTx = buildRecipesToolsRepository(tx);

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
          const createdRecipe =
            await recipesRepositoryForTx.create(recipeToInsert);
          const recipeId = createdRecipe.id;

          await Promise.all([
            insertIngredients(
              recipeId,
              ingredients,
              ingredientsRepositoryForTx,
              recipesIngredientsRepositoryForTx
            ),

            insertTools(
              recipeId,
              tools,
              toolsRepositoryForTx,
              recipesToolsRepositoryForTx
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

    async findById(recipeId) {
      const recipe = await recipesRepository.findById(recipeId);

      if (!recipe) {
        throw new RecipeNotFound();
      }

      recipe.imageUrl = await signImages(recipe.imageUrl);

      return recipe;
    },

    async findAll(pagination) {
      const recipes = await recipesRepository.findAll(pagination);

      const recipeIds = recipes.map(recipe => recipe.id);
      const imageUrls = recipes.map(recipe => recipe.imageUrl);

      const [ratings, signedUrls] = await Promise.all([
        ratingsService.getRecipeRatingsBatch(recipeIds),
        signImages(imageUrls),
      ]);

      for (const [index, recipe] of recipes.entries()) {
        recipe.imageUrl = signedUrls[index];
      }

      const recipesWithRatings: RecipesPublic[] = recipes.map(recipe => ({
        ...recipe,
        rating: ratings[recipe.id],
      }));

      return recipesWithRatings;
    },
  };
}
