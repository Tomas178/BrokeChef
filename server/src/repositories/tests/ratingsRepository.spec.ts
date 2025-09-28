import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import { fakeRating, fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { ratingsRepository } from '../ratingsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = ratingsRepository(database);

const [user] = await insertAll(database, 'users', fakeUser());

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: user.id })
);

const nonExistantUserId = user.id + 'a';
const nonExistantRecipeId = recipe.id + 1;

const fakeRecipeToRate = fakeRating({
  recipeId: recipe.id,
  userId: user.id,
});

describe('create', () => {
  it('Should create a new rating', async () => {
    const ratedRecipe = await repository.create(fakeRecipeToRate);

    expect(ratedRecipe).toMatchObject({
      userId: user.id,
      recipeId: recipe.id,
      rating: fakeRecipeToRate.rating,
    });
  });

  it('Should throw if recipe does not exist', async () => {
    await expect(
      repository.create({ ...fakeRecipeToRate, recipeId: nonExistantRecipeId })
    ).rejects.toThrow();
  });

  it('Should throw if user does not exist', async () => {
    await expect(
      repository.create({ ...fakeRecipeToRate, userId: nonExistantUserId })
    ).rejects.toThrow();
  });
});

describe('remove', () => {
  it('Should remove rating', async () => {
    const [ratedRecipe] = await insertAll(
      database,
      'ratings',
      fakeRecipeToRate
    );

    const removedRating = await repository.remove(
      fakeRecipeToRate.recipeId,
      fakeRecipeToRate.userId
    );

    expect(removedRating).toMatchObject({
      userId: ratedRecipe.userId,
      recipeId: ratedRecipe.recipeId,
      rating: ratedRecipe.rating,
    });
  });

  it('Should throw an error if rating does not exist', async () => {
    await expect(
      repository.remove(nonExistantRecipeId, fakeRecipeToRate.userId)
    ).rejects.toThrow();
  });
});
