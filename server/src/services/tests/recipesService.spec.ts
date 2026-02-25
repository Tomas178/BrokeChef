import {
  fakeUser,
  fakeCreateRecipeData,
  fakeRecipe,
  fakeRecipeAllInfo,
  fakeRecipeWithRating,
} from '@server/entities/tests/fakes';
import { initialPage, initialPageWithSort } from '@server/entities/shared';
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
import type { SavedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import { getVector } from '@server/repositories/tests/utils';
import { recipesService } from '../recipesService';
import type { HasImageUrl } from '../utils/assignSignedUrls';

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
  mockAssignSignedUrls,
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
  mockAssignSignedUrls: vi.fn(<T extends HasImageUrl>(array: T[]) => {
    for (const element of array) {
      element.imageUrl = fakeImageUrl;
    }

    return array;
  }),
}));

vi.mock('@server/utils/signImages', () => ({
  signImages: mockSignImages,
}));

vi.mock('@server/services/utils/assignSignedUrls', () => ({
  assignSignedUrls: mockAssignSignedUrls,
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
const mockRecipesRepoSearch = vi.fn();
const mockRecipesRepoFindById = vi.fn();
const mockRecipesRepoFindAll = vi.fn();
const mockRecipesRepoRemove = vi.fn();

const mockRecipesRepository = {
  create: mockRecipesRepoCreate,
  search: mockRecipesRepoSearch,
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

const mockSavedRecipesRepoGetAverageUserEmbedding = vi.fn();
const mockSavedRecipesRepository: Partial<SavedRecipesRepository> = {
  getAverageUserEmbedding: mockSavedRecipesRepoGetAverageUserEmbedding,
};

vi.mock('@server/repositories/savedRecipesRepository', () => ({
  savedRecipesRepository: () => mockSavedRecipesRepository,
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

describe('search', () => {
  const userInput = 'Something very delicious';
  const embeddedInput = [0.1, 0.2, 0.3];

  beforeEach(() => mockGetEmbedding.mockResolvedValueOnce(embeddedInput));

  afterEach(() =>
    expect(mockRecipesRepoSearch).toHaveBeenCalledExactlyOnceWith(
      embeddedInput,
      initialPage
    )
  );

  it('Should return an empty list if no recipes found', async () => {
    mockRecipesRepoSearch.mockResolvedValueOnce([]);

    expect(service.search(userInput, initialPage));
  });

  it('Should return recipe with signed images', async () => {
    const fakeRecipes = [fakeRecipe(), fakeRecipe()];
    mockRecipesRepoSearch.mockResolvedValueOnce(fakeRecipes);

    const recipes = await service.search(userInput, initialPage);
    expect(recipes).toHaveLength(fakeRecipes.length);
    expect(recipes).toEqual(fakeRecipes);

    expect(mockAssignSignedUrls).toHaveBeenCalledOnce();
  });

  it('Should return recipes with ratings included as 0 when no ratings exist', async () => {
    const fakeRecipes = [
      fakeRecipeWithRating({ rating: 0 }),
      fakeRecipeWithRating({ rating: 0 }),
    ];
    mockRecipesRepoSearch.mockResolvedValueOnce(fakeRecipes);

    const recipes = await service.search(userInput, initialPage);
    expect(recipes).toHaveLength(fakeRecipes.length);
    expect(recipes).toEqual(fakeRecipes);

    expect(recipes[0]).toHaveProperty('rating', 0);
    expect(recipes[1]).toHaveProperty('rating', 0);
  });

  it('Should return recipes with ratings included as real ratings when ratings exist', async () => {
    const fakeRecipes = [fakeRecipeWithRating(), fakeRecipeWithRating()];
    mockRecipesRepoSearch.mockResolvedValueOnce(fakeRecipes);

    const recipes = await service.search(userInput, initialPage);
    expect(recipes).toHaveLength(fakeRecipes.length);

    expect(recipes[0]).toHaveProperty('rating', fakeRecipes[0].rating);
    expect(recipes[1]).toHaveProperty('rating', fakeRecipes[1].rating);
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

    expect(mockAssignSignedUrls).toHaveBeenCalledOnce();
  });

  it('Should return recipes with ratings included as 0 when no ratings exist', async () => {
    const fakeRecipes = [
      fakeRecipeWithRating({ rating: 0 }),
      fakeRecipeWithRating({ rating: 0 }),
    ];
    mockRecipesRepoFindAll.mockResolvedValueOnce(fakeRecipes);

    const recipes = await service.findAll(initialPageWithSort);
    expect(recipes).toHaveLength(fakeRecipes.length);
    expect(recipes).toEqual(fakeRecipes);

    expect(recipes[0]).toHaveProperty('rating', 0);
    expect(recipes[1]).toHaveProperty('rating', 0);
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

describe('findAllRecommended', () => {
  describe('search case', () => {
    beforeEach(() =>
      mockSavedRecipesRepoGetAverageUserEmbedding.mockResolvedValueOnce(
        getVector(0.1)
      )
    );

    it('Should call search method if user has saved recipes', async () => {
      mockRecipesRepoSearch.mockResolvedValueOnce([]);

      await expect(
        service.findAllRecommended(author.id, initialPage)
      ).resolves.toEqual([]);

      expect(mockRecipesRepoSearch).toHaveBeenCalledOnce();
      expect(mockRecipesRepoFindAll).not.toHaveBeenCalledOnce();
    });

    it('Should return recipes if user has saved recipes', async () => {
      const fakeRecipes = [fakeRecipeWithRating(), fakeRecipeWithRating()];
      mockRecipesRepoSearch.mockResolvedValueOnce(fakeRecipes);

      const recipes = await service.findAllRecommended(author.id, initialPage);
      expect(recipes).toBe(fakeRecipes);
    });
  });

  describe('findAll case', () => {
    it('Should call findAll method if user has no saved recipes', async () => {
      mockRecipesRepoFindAll.mockResolvedValueOnce([]);

      await expect(
        service.findAllRecommended(author.id, initialPage)
      ).resolves.toEqual([]);

      expect(mockRecipesRepoFindAll).toHaveBeenCalledOnce();
      expect(mockRecipesRepoSearch).not.toHaveBeenCalledOnce();
    });

    it('Should return recipes if user has no saved recipes', async () => {
      const fakeRecipes = [fakeRecipeWithRating(), fakeRecipeWithRating()];
      mockRecipesRepoFindAll.mockResolvedValueOnce(fakeRecipes);

      const recipes = await service.findAllRecommended(author.id, initialPage);
      expect(recipes).toBe(fakeRecipes);
    });
  });

  it('Should return recipes with signed images', async () => {
    const fakeRecipes = [fakeRecipe(), fakeRecipe()];
    mockRecipesRepoFindAll.mockResolvedValueOnce(fakeRecipes);

    const recipes = await service.findAllRecommended(author.id, initialPage);
    expect(recipes).toHaveLength(fakeRecipes.length);
    expect(recipes).toEqual(fakeRecipes);

    expect(mockAssignSignedUrls).toHaveBeenCalledOnce();
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
