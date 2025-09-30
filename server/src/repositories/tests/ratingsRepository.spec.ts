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

const [recipeOne, recipeTwo] = await insertAll(database, 'recipes', [
  fakeRecipe({ userId: userOne.id }),
  fakeRecipe({ userId: userOne.id }),
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
  it('Should return the average rating for recipe when single rating exists', async () => {
    const [insertedRating] = await insertAll(
      database,
      'ratings',
      fakeRecipeToRateOne
    );

    const rating = await repository.getRecipeRating(insertedRating.recipeId);

    expect(rating).toEqual(insertedRating.rating);
  });

  it('Should return the average rating for recipe when multiple ratings exist', async () => {
    const fakeRecipeToRateTwo = fakeRating({
      recipeId: recipeOne.id,
      userId: userTwo.id,
    });

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

  it('Should return 0 if no ratings exist for recipe', async () => {
    await expect(repository.getRecipeRating(nonExistantRecipeId)).resolves.toBe(
      0
    );
  });
});

describe('getRecipeRatingsBatch', () => {
  let recipeForBatch: { id: number };
  let fakeRecipeToRateTwo: ReturnType<typeof fakeRating>;

  beforeAll(async () => {
    [recipeForBatch] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: userOne.id })
    );

    fakeRecipeToRateTwo = fakeRating({
      recipeId: recipeForBatch.id,
      userId: userOne.id,
    });
  });

  it('Should return an array of 2 ratings that are correct when two recipeIds are given', async () => {
    const [ratedOne, ratedTwo] = await insertAll(database, 'ratings', [
      fakeRecipeToRateOne,
      fakeRecipeToRateTwo,
    ]);

    const recipeIds = [ratedOne.recipeId, ratedTwo.recipeId];

    const [ratingFromDatabaseOne, ratingFromDatabaseTwo] =
      await repository.getRecipeRatingsBatch(recipeIds);

    expect(ratingFromDatabaseOne).toEqual(ratedOne.rating);
    expect(ratingFromDatabaseTwo).toEqual(ratedTwo.rating);
  });

  it('Should return an array of rating and 0 when only one recipe rating is found', async () => {
    const [ratedOne] = await insertAll(
      database,
      'ratings',
      fakeRecipeToRateOne
    );

    const recipeIds = [ratedOne.recipeId, fakeRecipeToRateTwo.recipeId];

    const [realRating, ratingZero] =
      await repository.getRecipeRatingsBatch(recipeIds);

    expect(realRating).toBe(ratedOne.rating);
    expect(ratingZero).toBe(0);
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
