import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { savedRecipesRepository } from '../savedRecipesRepository';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';

const db = await wrapInRollbacks(createTestDatabase());
const repository = savedRecipesRepository(db);

const [user] = await insertAll(db, 'users', fakeUser());

const [recipe] = await insertAll(
  db,
  'recipes',
  fakeRecipe({ userId: user.id })
);

const initialPage = {
  offset: 0,
  limit: 5,
};

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
      db,
      'savedRecipes',
      fakeSavedRecipe({ userId: user.id, recipeId: recipe.id })
    );

    const removedSavedRecipe = await repository.remove(
      createdSavedRecipe.recipeId
    );

    expect(removedSavedRecipe).toEqual(createdSavedRecipe);
  });

  it('Should throw an error if saved recipe record does not exist', async () => {
    const nonExistantId = recipe.id + 1;

    await expect(repository.remove(nonExistantId)).rejects.toThrow();
  });
});
