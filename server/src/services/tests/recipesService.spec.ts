import {
  fakeUser,
  fakeCreateRecipeData,
  fakeRecipe,
  fakeRecipeAllInfo,
  fakeRecipeWithRating,
} from '@server/entities/tests/fakes';
import { initialPageWithSort } from '@server/entities/shared';
import { type RecipesRepository } from '@server/repositories/recipesRepository';
import type { IngredientsRepository } from '@server/repositories/ingredientsRepository';
import type { ToolsRepository } from '@server/repositories/toolsRepository';
import type { RecipesIngredientsRepository } from '@server/repositories/recipesIngredientsRepository';
import type { RecipesToolsRepository } from '@server/repositories/recipesToolsRepository';
import type { Database } from '@server/database';
import { PostgresError } from 'pg-error-enum';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { S3ServiceException } from '@aws-sdk/client-s3';
import { NoResultError } from 'kysely';
import { recipesService } from '../recipesService';

const fakeImageKey = 'fakeKey';
const fakeSteps = ['Step 1', 'Step 2'];
const fakeImageUrl = 'https://signed-url.com/folder/image.png';

const {
  mockDeleteFile,
  mockGenerateRecipeImage,
  mockSignImages,
  mockLoggerError,
  mockInsertIngredients,
  mockInsertTools,
  mockFormatRecipeForEmbedding,
  mockGetEmbedding,
} = vi.hoisted(() => ({
  mockDeleteFile: vi.fn(),
  mockGenerateRecipeImage: vi.fn(() => Buffer.from('image')),
  mockSignImages: vi.fn((images: string | string[]) => {
    if (Array.isArray(images)) {
      return images.map(() => fakeImageUrl);
    }
    return fakeImageUrl;
  }),
  mockLoggerError: vi.fn(),
  mockInsertIngredients: vi.fn(),
  mockInsertTools: vi.fn(),
  mockFormatRecipeForEmbedding: vi.fn(),
  mockGetEmbedding: vi.fn(),
}));

vi.mock('@server/utils/signImages', () => ({
  signImages: mockSignImages,
}));

vi.mock('@server/logger', () => ({
  default: {
    info: vi.fn(),
    error: mockLoggerError,
  },
}));

vi.mock('@server/utils/errors', () => ({
  assertPostgresError: vi.fn(),
  assertError: vi.fn(),
}));

vi.mock('@server/utils/GoogleGenAiClient/generateRecipeImage', () => ({
  generateRecipeImage: mockGenerateRecipeImage,
}));

vi.mock('@server/utils/AWSS3Client/uploadImage', () => ({
  uploadImage: vi.fn(() => fakeImageKey),
}));

vi.mock('@server/utils/AWSS3Client/deleteFile', () => ({
  deleteFile: mockDeleteFile,
}));

vi.mock('@server/repositories/utils/joinStepsToArray', () => ({
  joinStepsToArray: vi.fn(() => fakeSteps),
}));

vi.mock('@server/services/utils/inserts', () => ({
  insertIngredients: mockInsertIngredients,
  insertTools: mockInsertTools,
}));

vi.mock('@server/utils/OpenAI/formatRecipeForEmbedding', () => ({
  formatRecipeForEmbedding: mockFormatRecipeForEmbedding,
}));

vi.mock('@server/utils/OpenAI/getEmbedding', () => ({
  getEmbedding: mockGetEmbedding,
}));

const mockRecipesRepoCreate = vi.fn();
const mockRecipesRepoFindById = vi.fn();
const mockRecipesRepoFindAll = vi.fn();
const mockRecipesRepoRemove = vi.fn();

const mockRecipesRepository = {
  create: mockRecipesRepoCreate,
  findById: mockRecipesRepoFindById,
  findAll: mockRecipesRepoFindAll,
  remove: mockRecipesRepoRemove,
} as Partial<RecipesRepository>;

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepository,
}));

const mockIngredientsRepository = {} as IngredientsRepository;
const mockRecipesIngredientsRepository = {} as RecipesIngredientsRepository;
const mockToolsRepository = {} as ToolsRepository;
const mockRecipesToolsRepository = {} as RecipesToolsRepository;

vi.mock('@server/repositories/ingredientsRepository', () => ({
  ingredientsRepository: () => mockIngredientsRepository,
}));

vi.mock('@server/repositories/recipesIngredientsRepository', () => ({
  recipesIngredientsRepository: () => mockRecipesIngredientsRepository,
}));

vi.mock('@server/repositories/toolsRepository', () => ({
  toolsRepository: () => mockToolsRepository,
}));

vi.mock('@server/repositories/recipesToolsRepository', () => ({
  recipesToolsRepository: () => mockRecipesToolsRepository,
}));

const database = {
  transaction: vi.fn(() => ({
    execute: vi.fn(async callback => {
      return await callback();
    }),
  })),
} as unknown as Database;

const service = recipesService(database);

const author = fakeUser();

beforeEach(() => vi.resetAllMocks());

describe('createRecipe', () => {
  it('Should create a new recipe with user given image', async () => {
    const recipeData = fakeRecipe({ userId: author.id });
    mockRecipesRepoCreate.mockResolvedValueOnce(recipeData);

    const createdRecipe = await service.createRecipe(
      fakeCreateRecipeData(),
      author.id
    );

    expect(mockInsertIngredients).toHaveBeenCalledOnce();
    expect(mockInsertTools).toHaveBeenCalledOnce();
    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
    expect(createdRecipe).toEqual(recipeData);
  });

  it('Should create a new recipe with generated image when user did not provide an image', async () => {
    const recipeData = fakeRecipe({ userId: author.id });
    mockRecipesRepoCreate.mockResolvedValueOnce(recipeData);

    const createdRecipe = await service.createRecipe(
      fakeCreateRecipeData({ imageUrl: undefined }),
      author.id
    );

    expect(mockInsertIngredients).toHaveBeenCalledOnce();
    expect(mockInsertTools).toHaveBeenCalledOnce();
    expect(mockGenerateRecipeImage).toHaveBeenCalledOnce();
    expect(createdRecipe).toEqual(recipeData);
  });

  it('Should throw an error if user is not found', async () => {
    mockRecipesRepoCreate.mockRejectedValueOnce({
      code: PostgresError.FOREIGN_KEY_VIOLATION,
    });

    await expect(
      service.createRecipe(fakeCreateRecipeData(), author.id + 'a')
    ).rejects.toThrow(/not found/i);

    expect(mockInsertIngredients).not.toHaveBeenCalled();
    expect(mockInsertTools).not.toHaveBeenCalled();
  });

  it('Should throw an error if recipe is already created by the user', async () => {
    mockRecipesRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(
      service.createRecipe(fakeCreateRecipeData(), author.id)
    ).rejects.toThrow(/already|created/i);

    expect(mockInsertIngredients).not.toHaveBeenCalled();
    expect(mockInsertTools).not.toHaveBeenCalled();
  });

  it('Should rollback if an error occurs when image was provided', async () => {
    mockRecipesRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(
      service.createRecipe(fakeCreateRecipeData(), author.id)
    ).rejects.toThrow(/already|created/i);

    expect(mockInsertIngredients).not.toHaveBeenCalled();
    expect(mockInsertTools).not.toHaveBeenCalled();
    expect(mockDeleteFile).not.toHaveBeenCalled();

    expect(mockLoggerError).toHaveBeenCalledOnce();
  });

  it('Should rollback if an error occurs when image was not provided', async () => {
    mockRecipesRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(
      service.createRecipe(
        fakeCreateRecipeData({ imageUrl: undefined }),
        author.id
      )
    ).rejects.toThrow();

    expect(mockInsertIngredients).not.toHaveBeenCalled();
    expect(mockInsertTools).not.toHaveBeenCalled();

    expect(mockDeleteFile).toHaveBeenCalledOnce();
    expect(mockLoggerError).toHaveBeenCalledOnce();
  });

  it('Should log an error message if deletion of image on rollback failed', async () => {
    mockRecipesRepoCreate.mockRejectedValueOnce({
      code: PostgresError.FOREIGN_KEY_VIOLATION,
    });
    mockDeleteFile.mockRejectedValueOnce(new Error('Failed to delete from S3'));

    await expect(
      service.createRecipe(
        fakeCreateRecipeData({ imageUrl: undefined }),
        author.id
      )
    ).rejects.toThrow(/not found/i);

    expect(mockInsertIngredients).not.toHaveBeenCalled();
    expect(mockInsertTools).not.toHaveBeenCalled();

    expect(mockDeleteFile).toHaveBeenCalledOnce();
    expect(mockDeleteFile).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      fakeImageKey
    );

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to rollback S3 Object:',
      expect.any(Error)
    );
  });

  it('Should log an error message if image generation threw an error', async () => {
    const errorMessage = 'AI Failed';
    mockGenerateRecipeImage.mockRejectedValueOnce(new Error(errorMessage));

    await expect(
      service.createRecipe(
        fakeCreateRecipeData({ imageUrl: undefined }),
        author.id
      )
    ).rejects.toThrow(errorMessage);

    expect(mockInsertIngredients).not.toHaveBeenCalled();
    expect(mockInsertTools).not.toHaveBeenCalled();
    expect(mockDeleteFile).not.toHaveBeenCalled();

    expect(mockLoggerError).toHaveBeenCalledOnce();
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to generate recipe image:',
      expect.any(Error)
    );
  });
});

describe('findById', () => {
  it('Should return the recipe', async () => {
    const recipeData = fakeRecipeAllInfo({ userId: author.id });
    mockRecipesRepoFindById.mockResolvedValueOnce(recipeData);

    const retrievedRecipe = await service.findById(recipeData.id);

    expect(mockSignImages).toHaveBeenCalledOnce();
    expect(retrievedRecipe).toHaveProperty('rating', recipeData.rating);
  });

  it('Should throw an error if recipe is not found', async () => {
    mockRecipesRepoFindById.mockResolvedValueOnce(undefined);

    expect(mockSignImages).not.toHaveBeenCalledOnce();
    await expect(service.findById(999)).rejects.toThrow(/not found/i);
  });
});

describe('findAll', () => {
  it('Should return an empty list if no recipes found', async () => {
    mockRecipesRepoFindAll.mockResolvedValueOnce([]);

    await expect(service.findAll(initialPageWithSort)).resolves.toEqual([]);
    expect(mockSignImages).not.toHaveBeenCalled();
  });

  it('Should return recipes with signed images', async () => {
    const fakeRecipes = [fakeRecipe(), fakeRecipe()];
    mockRecipesRepoFindAll.mockResolvedValueOnce(fakeRecipes);

    const recipes = await service.findAll(initialPageWithSort);
    expect(recipes).toHaveLength(fakeRecipes.length);
    expect(recipes).toEqual(fakeRecipes);

    expect(mockSignImages).toHaveBeenCalledOnce();
  });

  it('Should return recipes with ratings included as undefined when no ratings exist', async () => {
    const fakeRecipes = [
      fakeRecipeWithRating({ rating: undefined }),
      fakeRecipeWithRating({ rating: undefined }),
    ];
    mockRecipesRepoFindAll.mockResolvedValueOnce(fakeRecipes);

    const recipes = await service.findAll(initialPageWithSort);
    expect(recipes).toHaveLength(fakeRecipes.length);
    expect(recipes).toEqual(fakeRecipes);

    expect(recipes[0]).toHaveProperty('rating', undefined);
    expect(recipes[1]).toHaveProperty('rating', undefined);
  });

  it('Should return recipes with ratings included as real ratings when ratings exist', async () => {
    const fakeRecipes = [fakeRecipeWithRating(), fakeRecipeWithRating()];
    mockRecipesRepoFindAll.mockResolvedValueOnce(fakeRecipes);

    const recipes = await service.findAll(initialPageWithSort);
    expect(recipes).toHaveLength(fakeRecipes.length);

    expect(recipes[0]).toHaveProperty('rating', fakeRecipes[0].rating);
    expect(recipes[1]).toHaveProperty('rating', fakeRecipes[1].rating);
  });
});

describe('remove', () => {
  const recipeId = 123;

  it('Should throw an error if recipe does not exist', async () => {
    mockRecipesRepoFindById.mockResolvedValueOnce(undefined);

    await expect(service.remove(recipeId)).rejects.toThrowError(RecipeNotFound);
    expect(mockRecipesRepoRemove).not.toHaveBeenCalled();
    expect(mockDeleteFile).not.toHaveBeenCalled();
  });

  it('Should throw an error if database record removal failed', async () => {
    mockRecipesRepoFindById.mockResolvedValueOnce(fakeRecipeAllInfo());
    mockRecipesRepoRemove.mockRejectedValueOnce(new NoResultError({} as any));

    await expect(service.remove(recipeId)).rejects.toThrowError(RecipeNotFound);
  });

  it('Should throw an error if image deletion from S3 failed', async () => {
    const recipe = fakeRecipeWithRating();

    mockRecipesRepoFindById.mockResolvedValueOnce(fakeRecipeAllInfo());
    mockRecipesRepoRemove.mockResolvedValueOnce(recipe);
    mockDeleteFile.mockRejectedValueOnce(new S3ServiceException({} as any));

    await expect(service.remove(recipeId)).rejects.toThrowError(
      S3ServiceException
    );
  });

  it('Should return removed recipe and delete image from S3', async () => {
    const recipe = fakeRecipeWithRating();

    mockRecipesRepoFindById.mockResolvedValueOnce(fakeRecipeAllInfo());
    mockRecipesRepoRemove.mockResolvedValueOnce(recipe);

    await expect(service.remove(recipeId)).resolves.toEqual(recipe);
  });
});
