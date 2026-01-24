import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipeDB,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import pgvector from 'pgvector/kysely';
import { savedRecipesRepository } from '../savedRecipesRepository';
import { getVector } from './utils';

const database = await wrapInRollbacks(createTestDatabase());
const repository = savedRecipesRepository(database);

const [user] = await insertAll(database, 'users', fakeUser());

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipeDB({ userId: user.id })
);

const nonExistantUserId = user.id + 1;
const nonExistantRecipeId = recipe.id + 1;

describe('create', () => {
  it('Should create a new saved recipe', async () => {
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
    await expect(
      repository.create({ userId: user.id, recipeId: nonExistantRecipeId })
    ).rejects.toThrow();
  });

  it('Should throw if user does not exist', async () => {
    await expect(
      repository.create({ userId: nonExistantUserId, recipeId: recipe.id })
    ).rejects.toThrow();
  });
});

describe('remove', () => {
  it('Should remove saved recipe', async () => {
    const [createdSavedRecipe] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: user.id, recipeId: recipe.id })
    );

    const removedSavedRecipe = await repository.remove({
      recipeId: createdSavedRecipe.recipeId,
      userId: createdSavedRecipe.userId,
    });

    expect(removedSavedRecipe).toEqual(createdSavedRecipe);
  });

  it('Should throw an error if saved recipe record does not exist', async () => {
    await expect(
      repository.remove({ recipeId: nonExistantRecipeId, userId: user.id })
    ).rejects.toThrow();
  });
});

describe('isSaved', () => {
  it('Should return true', async () => {
    const [createdSavedRecipe] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: user.id, recipeId: recipe.id })
    );

    const isSaved = await repository.isSaved({
      recipeId: createdSavedRecipe.recipeId,
      userId: createdSavedRecipe.userId,
    });

    expect(isSaved).toBeTruthy();
  });

  it('Should return false', async () => {
    const isSaved = await repository.isSaved({
      recipeId: nonExistantRecipeId,
      userId: user.id,
    });

    expect(isSaved).toBeFalsy();
  });

  describe('getAverageUserEmbedding', () => {
    it('Should return undefined if no result was returned', async () => {
      const averageEmbedding = await repository.getAverageUserEmbedding(
        user.id
      );
      expect(averageEmbedding).toBeUndefined();
    });

    it('Should return the correct average embedding for a single saved recipe', async () => {
      const vector = getVector(0.1);
      const [recipeWithEmbedding] = await insertAll(
        database,
        'recipes',
        fakeRecipeDB({ userId: user.id, embedding: pgvector.toSql(vector) })
      );

      await insertAll(
        database,
        'savedRecipes',
        fakeSavedRecipe({ userId: user.id, recipeId: recipeWithEmbedding.id })
      );

      const avgEmbedding = await repository.getAverageUserEmbedding(user.id);
      expect(avgEmbedding).toEqual(vector);
    });

    it('Should return the calculated average embedding for multiple saved recipes', async () => {
      const vectorA = getVector(0.1);
      const vectorB = getVector(0.2);

      const [recipe1, recipe2] = await insertAll(database, 'recipes', [
        fakeRecipeDB({
          userId: user.id,
          embedding: pgvector.toSql(vectorA),
        }),
        fakeRecipeDB({
          userId: user.id,
          embedding: pgvector.toSql(vectorB),
        }),
      ]);

      await insertAll(database, 'savedRecipes', [
        fakeSavedRecipe({ userId: user.id, recipeId: recipe1.id }),
        fakeSavedRecipe({ userId: user.id, recipeId: recipe2.id }),
      ]);

      const avgEmbedding = await repository.getAverageUserEmbedding(user.id);

      expect(avgEmbedding![0]).toBeCloseTo(0.15);
      expect(avgEmbedding![1]).toBeCloseTo(0.15);
      expect(avgEmbedding![2]).toBeCloseTo(0.15);
    });
  });
});
