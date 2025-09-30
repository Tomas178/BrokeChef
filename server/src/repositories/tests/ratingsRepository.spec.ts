import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import { fakeRating, fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { ratingsRepository } from '../ratingsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = ratingsRepository(database);

const [userOne, userTwo] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: userOne.id })
);

const nonExistantUserId = userOne.id + 'a';
const nonExistantRecipeId = recipe.id + 1;

const [fakeRecipeToRateOne, fakeRecipeToRateTwo, fakeRecipeForUpdate] = [
  fakeRating({
    recipeId: recipe.id,
    userId: userOne.id,
  }),
  fakeRating({
    recipeId: recipe.id,
    userId: userTwo.id,
  }),
  fakeRating({
    recipeId: recipe.id,
    userId: userOne.id,
  }),
];

describe('getUserRating', () => {
  it('Should return the rating', async () => {
    await insertAll(database, 'ratings', fakeRecipeToRateOne);

    const retrievedRecipe = await repository.getUserRating(
      fakeRecipeToRateOne.recipeId,
      fakeRecipeToRateOne.userId
    );

    expect(retrievedRecipe).toEqual(fakeRecipeToRateOne);
  });

  it('Should return undefined if rating does not exist', async () => {
    await expect(
      repository.getUserRating(
        fakeRecipeToRateOne.recipeId,
        fakeRecipeToRateOne.userId
      )
    ).resolves.toBeUndefined();
  });
});

describe('getRecipeRating', () => {
  it('Should return the average rating when single rating exists', async () => {
    const [insertedRating] = await insertAll(
      database,
      'ratings',
      fakeRecipeToRateOne
    );

    const rating = await repository.getRecipeRating(insertedRating.recipeId);

    expect(rating).toEqual(insertedRating.rating);
  });

  it('Should return the average rating when multiple ratings exist', async () => {
    const [insertedRatingOne, insertedRatingTwo] = await insertAll(
      database,
      'ratings',
      [fakeRecipeToRateOne, fakeRecipeToRateTwo]
    );

    const averageRating =
      (insertedRatingOne.rating + insertedRatingTwo.rating) / 2;

    const databaseRating = await repository.getRecipeRating(
      insertedRatingOne.recipeId
    );

    expect(databaseRating).toEqual(averageRating);
  });

  it('Should return undefined if no ratings exist', async () => {
    await expect(
      repository.getRecipeRating(nonExistantRecipeId)
    ).resolves.toBeUndefined();
  });
});

describe('create', () => {
  it('Should create a new rating', async () => {
    const ratedRecipe = await repository.create(fakeRecipeToRateOne);

    expect(ratedRecipe).toMatchObject({
      userId: fakeRecipeToRateOne.userId,
      recipeId: fakeRecipeToRateOne.recipeId,
      rating: fakeRecipeToRateOne.rating,
    });
  });

  it('Should throw if recipe does not exist', async () => {
    await expect(
      repository.create({
        ...fakeRecipeToRateOne,
        recipeId: nonExistantRecipeId,
      })
    ).rejects.toThrow();
  });

  it('Should throw if user does not exist', async () => {
    await expect(
      repository.create({ ...fakeRecipeToRateOne, userId: nonExistantUserId })
    ).rejects.toThrow();
  });
});

describe('update', () => {
  it('Should update the rating', async () => {
    await insertAll(database, 'ratings', fakeRecipeToRateOne);

    const updatedRating = await repository.update(fakeRecipeForUpdate);

    expect(updatedRating).toMatchObject({
      recipeId: fakeRecipeForUpdate.recipeId,
      userId: fakeRecipeForUpdate.userId,
      rating: fakeRecipeForUpdate.rating,
    });
  });

  it('Should throw an error if rating does not exist', async () => {
    await expect(
      repository.remove(nonExistantRecipeId, fakeRecipeForUpdate.userId)
    ).rejects.toThrow();
  });
});

describe('remove', () => {
  it('Should remove rating', async () => {
    const [ratedRecipe] = await insertAll(
      database,
      'ratings',
      fakeRecipeToRateOne
    );

    const removedRating = await repository.remove(
      fakeRecipeToRateOne.recipeId,
      fakeRecipeToRateOne.userId
    );

    expect(removedRating).toMatchObject({
      userId: ratedRecipe.userId,
      recipeId: ratedRecipe.recipeId,
      rating: ratedRecipe.rating,
    });
  });

  it('Should throw an error if rating does not exist', async () => {
    await expect(
      repository.remove(nonExistantRecipeId, fakeRecipeToRateOne.userId)
    ).rejects.toThrow();
  });
});
