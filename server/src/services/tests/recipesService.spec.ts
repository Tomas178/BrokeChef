import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { clearTables, insertAll, selectAll } from '@tests/utils/record';
import {
  fakeUser,
  fakeCreateRecipeData,
  fakeRecipe,
  fakeRating,
} from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublicWithoutId } from '@server/entities/users';
import { initialPage } from '@server/entities/shared';
import { joinStepsToSingleString } from '../utils/joinStepsToSingleString';
import { recipesService } from '../recipesService';

const fakeImageKey = 'fakeKey';
const fakeSteps = ['Step 1', 'Step 2'];
const fakeImageUrl = 'https://signed-url.com/folder/image.png';

const { mockDeleteFile, mockLoggerError } = vi.hoisted(() => ({
  mockDeleteFile: vi.fn(),
  mockLoggerError: vi.fn(),
}));

vi.mock('@server/utils/signImages', () => ({
  signImages: vi.fn((images: string | string[]) => {
    if (Array.isArray(images)) {
      return images.map(() => fakeImageUrl);
    }
    return fakeImageUrl;
  }),
}));

vi.mock('@server/logger', () => ({
  default: {
    info: vi.fn(),
    error: mockLoggerError,
  },
}));

vi.mock('@server/utils/GoogleGenAiClient/generateRecipeImage', () => ({
  generateRecipeImage: vi.fn(() => Buffer.from('image')),
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

const database = await wrapInRollbacks(createTestDatabase());
const service = recipesService(database);

const [author, rater] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

beforeEach(async () => {
  await clearTables(database, ['recipes', 'ingredients', 'tools', 'ratings']);
  vi.resetAllMocks();
});

describe('createRecipe', () => {
  it('Should create a new recipe with user given image', async () => {
    const recipeData = fakeCreateRecipeData();

    const stepsInASingleString = joinStepsToSingleString(recipeData.steps);

    const createdRecipe = await service.createRecipe(recipeData, author.id);

    expect(createdRecipe).toMatchObject({
      id: expect.any(Number),
      ...pick(recipeData, recipesKeysPublic),
      steps: stepsInASingleString,
      author: pick(author, usersKeysPublicWithoutId),
    });
  });

  it('Should create a new recipe with generated image when user did not provide an image', async () => {
    const recipeData = fakeCreateRecipeData({ imageUrl: '' });

    const stepsInASingleString = joinStepsToSingleString(recipeData.steps);

    const createdRecipe = await service.createRecipe(recipeData, author.id);

    expect(createdRecipe).toMatchObject({
      id: expect.any(Number),
      ...pick(recipeData, recipesKeysPublic),
      steps: stepsInASingleString,
      author: pick(author, usersKeysPublicWithoutId),
      imageUrl: fakeImageKey,
    });
  });

  it('Should throw an error if user is not found', async () => {
    const recipeData = fakeCreateRecipeData();
    const nonExistantUserId = author.id + 'a';

    await expect(
      service.createRecipe(recipeData, nonExistantUserId)
    ).rejects.toThrow(/not found/i);
  });

  it('Should rollback if an error occurs', async () => {
    const recipeData = fakeCreateRecipeData();
    recipeData.ingredients.push('');

    await expect(service.createRecipe(recipeData, author.id)).rejects.toThrow();

    await expect(selectAll(database, 'recipes')).resolves.toHaveLength(0);
    await expect(selectAll(database, 'ingredients')).resolves.toHaveLength(0);
    await expect(selectAll(database, 'tools')).resolves.toHaveLength(0);
  });

  it('Should delete an image from the S3 storage on insertion failure', async () => {
    const recipeData = fakeCreateRecipeData();
    const nonExistantUserId = author.id + 'a';

    mockDeleteFile.mockRejectedValueOnce(new Error('Failed to delete from S3'));

    await expect(
      service.createRecipe(recipeData, nonExistantUserId)
    ).rejects.toThrow(/not found/i);

    expect(mockDeleteFile).toHaveBeenCalledOnce();

    expect(mockDeleteFile).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      recipeData.imageUrl
    );

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to rollback S3 Object:',
      expect.any(Error)
    );
  });
});

describe('findById', () => {
  it('Should return the recipe', async () => {
    const [insertedRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: author.id })
    );

    const retrievedRecipe = await service.findById(insertedRecipe.id);

    expect(retrievedRecipe).toEqual({
      ...insertedRecipe,
      author: pick(author, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      ingredients: [],
      tools: [],
      steps: fakeSteps,
      rating: null,
    });
  });

  it('Should return a recipe with a rating when rating exists', async () => {
    const [insertedRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: author.id })
    );

    const [ratingForRecipe] = await insertAll(
      database,
      'ratings',
      fakeRating({ userId: rater.id, recipeId: insertedRecipe.id })
    );

    const retrievedRecipe = await service.findById(insertedRecipe.id);

    expect(retrievedRecipe).toHaveProperty('rating', ratingForRecipe.rating);
  });

  it('Should throw an error if recipe is not found', async () => {
    await expect(service.findById(999)).rejects.toThrow(/not found/i);
  });
});

describe('findAll', () => {
  it('Should return an empty list when no recipeIds are given', async () => {
    await expect(service.findAll(initialPage)).resolves.toEqual([]);
  });

  it('Should return recipes with signed images', async () => {
    const [recipeOne, recipeTwo] = await insertAll(database, 'recipes', [
      fakeRecipe({ userId: author.id }),
      fakeRecipe({ userId: author.id }),
    ]);

    const recipes = await service.findAll(initialPage);
    expect(recipes).toHaveLength(2);

    expect(recipes[0]).toMatchObject({
      id: recipeTwo.id,
      imageUrl: fakeImageUrl,
    });
    expect(recipes[1]).toMatchObject({
      id: recipeOne.id,
      imageUrl: fakeImageUrl,
    });
  });

  it('Should return recipes with ratings included as undefined when no ratings exist', async () => {
    const insertedRecipes = await insertAll(database, 'recipes', [
      fakeRecipe({ userId: author.id }),
      fakeRecipe({ userId: author.id }),
    ]);

    const recipes = await service.findAll(initialPage);
    expect(recipes).toHaveLength(insertedRecipes.length);

    expect(recipes[0]).toHaveProperty('rating', undefined);
    expect(recipes[1]).toHaveProperty('rating', undefined);
  });

  it('Should return recipes with ratings included as real ratings when ratings exist', async () => {
    const [recipeOne, recipeTwo] = await insertAll(database, 'recipes', [
      fakeRecipe({ userId: author.id }),
      fakeRecipe({ userId: author.id }),
    ]);

    const [ratedRecipeOne, ratedRecipeTwo] = await insertAll(
      database,
      'ratings',
      [
        fakeRating({ userId: rater.id, recipeId: recipeOne.id }),
        fakeRating({ userId: rater.id, recipeId: recipeTwo.id }),
      ]
    );

    const recipes = await service.findAll(initialPage);
    expect(recipes).toHaveLength(2);

    expect(recipes[0]).toHaveProperty('rating', ratedRecipeTwo.rating);
    expect(recipes[1]).toHaveProperty('rating', ratedRecipeOne.rating);
  });
});
