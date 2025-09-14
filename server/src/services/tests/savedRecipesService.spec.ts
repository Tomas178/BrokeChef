import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { savedRecipesService } from '../savedRecipesService';

const database = await wrapInRollbacks(createTestDatabase());
const service = savedRecipesService(database);

const [userCreator, userSaver] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: userCreator.id })
);

const nonExistantRecipeId = recipe.id + 1;

describe('create', () => {
  it('Should create a new saved recipe', async () => {
    const savedRecipe = await service.create(userSaver.id, recipe.id);

    expect(savedRecipe).toMatchObject({
      userId: userSaver.id,
      recipeId: recipe.id,
    });
  });

  it('Should throw an error of duplicate', async () => {
    const [savedRecipe] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: userSaver.id, recipeId: recipe.id })
    );

    await expect(
      service.create(savedRecipe.userId, savedRecipe.recipeId)
    ).rejects.toThrow(/saved/i);
  });

  it('Should throw an error that recipe does not exist', async () => {
    await expect(
      service.create(userSaver.id, nonExistantRecipeId)
    ).rejects.toThrow(/recipe.*not found|not found.* recipe/i);
  });

  it('Should throw an error because user tries to save his own recipe', async () => {
    await expect(service.create(userCreator.id, recipe.id)).rejects.toThrow(
      /own.*save|save.*own/i
    );
  });
});

describe('remove', () => {
  it('Should unsave a recipe', async () => {
    const [savedRecipe] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: userSaver.id, recipeId: recipe.id })
    );

    const unsavedRecipe = await service.remove(
      savedRecipe.recipeId,
      savedRecipe.userId
    );

    expect(unsavedRecipe).toEqual(savedRecipe);
  });

  it('Should throw an error that recipe does not exist', async () => {
    await expect(
      service.remove(nonExistantRecipeId, userSaver.id)
    ).rejects.toThrow(/recipe.*not found|not found.*recipe/i);
  });

  it('Should throw an error that saved recipe with given data does not exist', async () => {
    const [savedRecipe] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: userSaver.id, recipeId: recipe.id })
    );

    const nonExistantUserId = userSaver.id + 'a';

    await expect(
      service.remove(savedRecipe.recipeId, nonExistantUserId)
    ).rejects.toThrow(/not found/i);
  });
});
