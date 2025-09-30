import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { clearTables, insertAll, selectAll } from '@tests/utils/record';
import {
  fakeUser,
  fakeCreateRecipeData,
  fakeRecipe,
} from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublicWithoutId } from '@server/entities/users';
import { joinStepsToSingleString } from '../utils/joinStepsToSingleString';
import { recipesService } from '../recipesService';

const fakeImageKey = 'fakeKey';
const fakeSteps = ['Step 1', 'Step 2'];

const { mockDeleteFile, mockLoggerError } = vi.hoisted(() => ({
  mockDeleteFile: vi.fn(),
  mockLoggerError: vi.fn(),
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

const [user] = await insertAll(database, 'users', [fakeUser()]);

beforeEach(async () => {
  await clearTables(database, ['recipes', 'ingredients', 'tools']);
  vi.resetAllMocks();
});

describe('createRecipe', () => {
  it('Should create a new recipe with user given image', async () => {
    const recipeData = fakeCreateRecipeData();

    const stepsInASingleString = joinStepsToSingleString(recipeData.steps);

    const createdRecipe = await service.createRecipe(recipeData, user.id);

    expect(createdRecipe).toMatchObject({
      id: expect.any(Number),
      ...pick(recipeData, recipesKeysPublic),
      steps: stepsInASingleString,
      author: pick(user, usersKeysPublicWithoutId),
    });
  });

  it('Should create a new recipe with generated image when user did not provide an image', async () => {
    const recipeData = fakeCreateRecipeData({ imageUrl: '' });

    const stepsInASingleString = joinStepsToSingleString(recipeData.steps);

    const createdRecipe = await service.createRecipe(recipeData, user.id);

    expect(createdRecipe).toMatchObject({
      id: expect.any(Number),
      ...pick(recipeData, recipesKeysPublic),
      steps: stepsInASingleString,
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageKey,
    });
  });

  it('Should throw an error if user is not found', async () => {
    const recipeData = fakeCreateRecipeData();
    const nonExistantUserId = user.id + 'a';

    await expect(
      service.createRecipe(recipeData, nonExistantUserId)
    ).rejects.toThrow(/not found/i);
  });

  it('Should rollback if an error occurs', async () => {
    const recipeData = fakeCreateRecipeData();
    recipeData.ingredients.push('');

    await expect(service.createRecipe(recipeData, user.id)).rejects.toThrow();

    await expect(selectAll(database, 'recipes')).resolves.toHaveLength(0);
    await expect(selectAll(database, 'ingredients')).resolves.toHaveLength(0);
    await expect(selectAll(database, 'tools')).resolves.toHaveLength(0);
  });

  it('Should delete an image from the S3 storage on insertion failure', async () => {
    const recipeData = fakeCreateRecipeData();
    const nonExistantUserId = user.id + 'a';

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
      fakeRecipe({ userId: user.id })
    );

    const retrievedRecipe = await service.findById(insertedRecipe.id);

    expect(retrievedRecipe).toEqual({
      ...insertedRecipe,
      author: pick(user, usersKeysPublicWithoutId),
      ingredients: [],
      tools: [],
      steps: fakeSteps,
      rating: null,
    });
  });

  it('Should throw an error if recipe is not found', async () => {
    await expect(service.findById(999)).rejects.toThrow(/not found/i);
  });
});
