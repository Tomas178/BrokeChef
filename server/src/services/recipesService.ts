import type { CreateRecipeInput } from '@server/controllers/recipes/create';
import type { Database } from '@server/database';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { ingredientsRepository as buildIngredientsRepository } from '@server/repositories/ingredientsRepository';
import { recipesIngredientsRepository as buildRecipesIngredientsRepository } from '@server/repositories/recipesIngredientsRepository';
import { toolsRepository as buildToolsRepository } from '@server/repositories/toolsRepository';
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
import { signImages } from '@server/utils/signImages';
import type { Pagination, PaginationWithSort } from '@server/shared/pagination';
import RecipeAlreadyCreated from '@server/utils/errors/recipes/RecipeAlreadyCreated';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { getEmbedding } from '@server/utils/OpenAI/getEmbedding';
import { openai } from '@server/utils/OpenAI/client';
import { formatRecipeForEmbedding } from '@server/utils/OpenAI/formatRecipeForEmbedding';
import { savedRecipesRepository as buildSavedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import { SortingTypes } from '@server/enums/SortingTypes';
import { joinStepsToSingleString } from './utils/joinStepsToSingleString';
import { insertIngredients, insertTools } from './utils/inserts';
import { validateRecipeExists } from './utils/recipeValidations';
import { rollbackImageUpload } from './utils/rollbackImageUpload';
import { assignSignedUrls } from './utils/assignSignedUrls';

export type CreateRecipeData = Omit<
  CreateRecipeInput,
  'steps' | 'imageUrl' | 'ingredients' | 'tools'
> & {
  steps: string;
  userId: string;
  imageUrl: string;
  embedding: number[];
};

export interface RecipesService {
  createRecipe: (
    recipe: CreateRecipeInput,
    userId: string
  ) => Promise<RecipesPublic | undefined>;
  search: (input: string, pagination: Pagination) => Promise<RecipesPublic[]>;
  findById: (recipeId: number) => Promise<RecipesPublicAllInfo | undefined>;
  findAll: (pagination: PaginationWithSort) => Promise<RecipesPublic[]>;
  findAllRecommended: (
    userId: string,
    pagination: Pagination
  ) => Promise<RecipesPublic[]>;
  remove: (recipeId: number) => Promise<RecipesPublic>;
}

async function handleRecipeImageGeneration(
  userProvidedUrl: string | undefined,
  recipeTitle: string,
  ingredients: CreateRecipeInput['ingredients']
): Promise<string> {
  if (userProvidedUrl) {
    return userProvidedUrl;
  }

  const generatedImage = await generateRecipeImage(ai, {
    title: recipeTitle,
    ingredients,
  });

  return await uploadImage(
    s3Client,
    ImageFolder.RECIPES,
    generatedImage,
    AllowedMimeType.JPEG
  );
}

export function recipesService(database: Database): RecipesService {
  const recipesRepository = buildRecipesRepository(database);
  const savedRecipesRepository = buildSavedRecipesRepository(database);

  return {
    async createRecipe(recipe, userId) {
      const { ingredients, tools, steps, ...recipeData } = recipe;

      const formattedText = formatRecipeForEmbedding({
        ...recipeData,
        ingredients,
        tools,
      });
      const embedding = await getEmbedding(openai, formattedText);

      let imageUrl: string;
      let isImageGenerated = false;

      try {
        imageUrl = await handleRecipeImageGeneration(
          recipeData.imageUrl,
          recipeData.title,
          ingredients
        );

        isImageGenerated = !recipeData.imageUrl;
      } catch (error) {
        logger.error('Failed to generate recipe image:', error);
        throw error;
      }

      const stepsAsSingleString = joinStepsToSingleString(steps);

      const recipeToInsert: CreateRecipeData = {
        ...recipeData,
        steps: stepsAsSingleString,
        userId,
        imageUrl,
        embedding,
      };

      return await database.transaction().execute(async tx => {
        const recipesRepositoryForTx = buildRecipesRepository(tx);
        const ingredientsRepositoryForTx = buildIngredientsRepository(tx);
        const recipesIngredientsRepositoryForTx =
          buildRecipesIngredientsRepository(tx);
        const toolsRepositoryForTx = buildToolsRepository(tx);
        const recipesToolsRepositoryForTx = buildRecipesToolsRepository(tx);

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

          logger.info(
            `User: ${userId} created recipe with ID: ${createdRecipe.id}`
          );
          return createdRecipe;
        } catch (error) {
          logger.error('Failed to create recipe');

          if (isImageGenerated) {
            await rollbackImageUpload(imageUrl);
          }

          assertPostgresError(error);

          if (error.code === PostgresError.FOREIGN_KEY_VIOLATION) {
            throw new UserNotFound();
          }

          if (error.code === PostgresError.UNIQUE_VIOLATION) {
            throw new RecipeAlreadyCreated();
          }
        }
      });
    },

    async search(userInput, pagination) {
      const embedding = await getEmbedding(openai, userInput);

      const recipes = await recipesRepository.search(embedding, pagination);

      const assignedRecipes = await assignSignedUrls(recipes);

      for (const recipe of assignedRecipes) {
        if (!recipe.rating) {
          recipe.rating = undefined;
        }
      }

      return recipes;
    },

    async findById(recipeId) {
      const recipe = await validateRecipeExists(recipesRepository, recipeId);

      recipe.imageUrl = await signImages(recipe.imageUrl);

      return recipe;
    },

    async findAll(pagination) {
      const recipes = await recipesRepository.findAll(pagination);

      const assignedRecipes = await assignSignedUrls(recipes);

      for (const recipe of assignedRecipes) {
        if (!recipe.rating) {
          recipe.rating = undefined;
        }
      }

      return recipes;
    },

    async findAllRecommended(userId, pagination) {
      const userVector =
        await savedRecipesRepository.getAverageUserEmbedding(userId);

      const recipes = await (userVector
        ? recipesRepository.search(userVector, pagination)
        : recipesRepository.findAll({
            ...pagination,
            sort: SortingTypes.NEWEST,
          }));

      const assignedRecipes = await assignSignedUrls(recipes);

      for (const recipe of assignedRecipes) {
        if (!recipe.rating) {
          recipe.rating = undefined;
        }
      }

      return recipes;
    },

    async remove(recipeId) {
      await validateRecipeExists(recipesRepository, recipeId);

      return await database.transaction().execute(async tx => {
        const recipesRepositoryForTx = buildRecipesRepository(tx);
        let removedRecipe: RecipesPublic;

        try {
          removedRecipe = await recipesRepositoryForTx.remove(recipeId);
        } catch {
          throw new RecipeNotFound();
        }

        const imageUrl = removedRecipe.imageUrl;

        try {
          await deleteFile(
            s3Client,
            config.auth.aws.s3.buckets.images,
            imageUrl
          );
          logger.info(`Deleted image: ${imageUrl} for recipe ${recipeId}`);
        } catch (error) {
          logger.error(
            `Failed to delete S3 image for recipe ${recipeId}: ${imageUrl}`
          );
          throw error;
        }

        logger.info(
          `Recipe ${removedRecipe.id} removed by user ${removedRecipe.userId}`
        );

        return removedRecipe;
      });
    },
  };
}
