import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { savedRecipesRepository } from '../savedRecipesRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = savedRecipesRepository(database);

const [user] = await insertAll(database, 'users', fakeUser());

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: user.id })
);

describe('create', () => {
  it('Should create a new save recipe', async () => {
    const savedRecipe = await repository.create({
      userId: user.id,
      recipeId: recipe.id,
    });

    expect(savedRecipe).toMatchObject({
      userId: user.id,
      recipeId: recipe.id,
    });
  });

  it('Should throw if recipe does not exist', async () => {
    const nonExistantId = recipe.id + 1;

    await expect(
      repository.create({ userId: user.id, recipeId: nonExistantId })
    ).rejects.toThrow();
  });

  it('Should throw if user does not exist', async () => {
    const nonExistantId = user.id + 1;

    await expect(
      repository.create({ userId: nonExistantId, recipeId: recipe.id })
    ).rejects.toThrow();
  });
});

describe('remove', async () => {
  it('Should remove saved recipe', async () => {
    const [createdSavedRecipe] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: user.id, recipeId: recipe.id })
    );

    const removedSavedRecipe = await repository.remove(
      createdSavedRecipe.recipeId,
      createdSavedRecipe.userId
    );

    expect(removedSavedRecipe).toEqual(createdSavedRecipe);
  });

  it('Should throw an error if saved recipe record does not exist', async () => {
    const nonExistantRecipeId = recipe.id + 1;

    await expect(
      repository.remove(nonExistantRecipeId, user.id)
    ).rejects.toThrow();
  });
});
