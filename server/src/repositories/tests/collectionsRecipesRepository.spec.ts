import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeCollection,
  fakeCollectionRecipe,
  fakeRecipeDB,
  fakeUser,
} from '@server/entities/tests/fakes';
import { collectionsRecipesRepository } from '../collectionsRecipesRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = collectionsRecipesRepository(database);

const [user] = await insertAll(database, 'users', fakeUser());

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipeDB({ userId: user.id })
);

const [collection] = await insertAll(
  database,
  'collections',
  fakeCollection({ userId: user.id })
);

const nonExistantRecipeId = recipe.id + 1;
const nonExistantCollectionId = collection.id + 1;

describe('create', () => {
  it('Should create a new recipe in collection', async () => {
    const savedRecipeInCollection = await repository.create({
      collectionId: collection.id,
      recipeId: recipe.id,
    });

    expect(savedRecipeInCollection).toMatchObject({
      collectionId: collection.id,
      recipeId: recipe.id,
    });
  });

  it('Should throw if recipe does not exist', async () => {
    await expect(
      repository.create({
        collectionId: collection.id,
        recipeId: nonExistantRecipeId,
      })
    ).rejects.toThrow();
  });

  it('Should throw if collection does not exist', async () => {
    await expect(
      repository.create({
        collectionId: nonExistantCollectionId,
        recipeId: recipe.id,
      })
    ).rejects.toThrow();
  });
});

describe('remove', () => {
  it('Should remove the recipe from collection', async () => {
    const [createdRecipeInCollection] = await insertAll(
      database,
      'collectionsRecipes',
      fakeCollectionRecipe({ collectionId: collection.id, recipeId: recipe.id })
    );

    const removedSavedRecipe = await repository.remove({
      collectionId: createdRecipeInCollection.collectionId,
      recipeId: createdRecipeInCollection.recipeId,
    });

    expect(removedSavedRecipe).toEqual(createdRecipeInCollection);
  });

  it('Should throw if collection does not exist', async () => {
    await expect(
      repository.create({
        collectionId: nonExistantCollectionId,
        recipeId: recipe.id,
      })
    ).rejects.toThrow();
  });

  it('Should throw if recipe does not exist', async () => {
    await expect(
      repository.create({
        collectionId: collection.id,
        recipeId: nonExistantRecipeId,
      })
    ).rejects.toThrow();
  });
});
