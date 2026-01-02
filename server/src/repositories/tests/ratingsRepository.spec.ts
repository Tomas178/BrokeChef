import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeRating,
  fakeRecipeDB,
  fakeUser,
} from '@server/entities/tests/fakes';
import { ratingsRepository } from '../ratingsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = ratingsRepository(database);

const [userOne, userTwo] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipeOne, recipeTwo] = await insertAll(database, 'recipes', [
  fakeRecipeDB({ userId: userOne.id }),
  fakeRecipeDB({ userId: userOne.id }),
]);

const nonExistantUserId = userOne.id + userTwo.id;
const nonExistantRecipeId = recipeOne.id + recipeTwo.id;

const [fakeRecipeToRateOne, fakeRecipeForUpdate] = [
  fakeRating({
    recipeId: recipeOne.id,
    userId: userOne.id,
  }),
  fakeRating({
    recipeId: recipeOne.id,
    userId: userOne.id,
  }),
];

describe('getUserRatingForRecipe', () => {
  it('Should return the rating', async () => {
    await insertAll(database, 'ratings', fakeRecipeToRateOne);

    const retrievedRecipe = await repository.getUserRatingForRecipe(
      fakeRecipeToRateOne.recipeId,
      fakeRecipeToRateOne.userId
    );

    expect(retrievedRecipe).toEqual(fakeRecipeToRateOne.rating);
  });

  it('Should return undefined if rating does not exist', async () => {
    await expect(
      repository.getUserRatingForRecipe(
        fakeRecipeToRateOne.recipeId,
        fakeRecipeToRateOne.userId
      )
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
