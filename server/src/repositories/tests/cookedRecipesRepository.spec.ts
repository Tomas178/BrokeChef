import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeCookedRecipe,
  fakeRecipeDB,
  fakeUser,
} from '@server/entities/tests/fakes';
import { cookedRecipesRepository } from '../cookedRecipesRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = cookedRecipesRepository(database);

const [user] = await insertAll(database, 'users', fakeUser());

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipeDB({ userId: user.id })
);

const nonExistantUserId = user.id + 1;
const nonExistantRecipeId = recipe.id + 1;

describe('create', () => {
  it('Should throw an error if user does not exist', async () => {
    await expect(
      repository.create({ userId: nonExistantUserId, recipeId: recipe.id })
    ).rejects.toThrow();
  });

  it('Should throw an error if recipe does not exist', async () => {
    await expect(
      repository.create({ userId: user.id, recipeId: nonExistantRecipeId })
    ).rejects.toThrow();
  });

  it('Should create a new cooked recipes link', async () => {
    const cookedRecipe = await repository.create({
      userId: user.id,
      recipeId: recipe.id,
    });

    expect(cookedRecipe).toMatchObject({
      userId: user.id,
      recipeId: recipe.id,
    });
  });
});

describe('remove', () => {
  it('Should throw an error if cooked recipe record does not exist', async () => {
    await expect(
      repository.remove({ userId: user.id, recipeId: nonExistantRecipeId })
    ).rejects.toThrow();
  });

  it('Should remove cooked recipe record', async () => {
    const [createdCookedRecipe] = await insertAll(
      database,
      'cookedRecipes',
      fakeCookedRecipe({
        userId: user.id,
        recipeId: recipe.id,
      })
    );

    const removedCookedRecipe = await repository.remove({
      userId: createdCookedRecipe.userId,
      recipeId: createdCookedRecipe.recipeId,
    });

    expect(removedCookedRecipe).toEqual(createdCookedRecipe);
  });
});

describe('isCooked', () => {
  it('Should return false', async () => {
    const isCooked = await repository.isCooked({
      userId: nonExistantUserId,
      recipeId: recipe.id,
    });

    expect(isCooked).toBeFalsy();
  });

  it('Should return true', async () => {
    const [createdCookedRecipe] = await insertAll(
      database,
      'cookedRecipes',
      fakeCookedRecipe({
        userId: user.id,
        recipeId: recipe.id,
      })
    );

    const isCooked = await repository.isCooked({
      userId: createdCookedRecipe.userId,
      recipeId: createdCookedRecipe.recipeId,
    });

    expect(isCooked).toBeTruthy();
  });
});
