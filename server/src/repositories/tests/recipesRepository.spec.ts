import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { clearTables, insertAll, selectAll } from '@tests/utils/record';
import {
  fakeCollection,
  fakeCollectionRecipe,
  fakeRating,
  fakeRecipe,
  fakeRecipeDB,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { omit, pick } from 'lodash-es';
import {
  recipesKeysPublic,
  type RecipesPublicWithoutRating,
} from '@server/entities/recipes';
import {
  usersKeysPublicWithoutId,
  type UsersPublic,
} from '@server/entities/users';
import { initialPage, initialPageWithSort } from '@server/entities/shared';
import { SortingTypes } from '@server/enums/SortingTypes';
import { NoResultError } from 'kysely';
import pgvector from 'pgvector/kysely';
import { recipesRepository } from '../recipesRepository';
import { getVector } from './utils';

const database = await wrapInRollbacks(createTestDatabase());
const repository = recipesRepository(database);

await clearTables(database, ['recipes', 'tools', 'ingredients']);

const [authorOne, authorTwo, userRater] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
  fakeUser(),
]);

const defaultRecipes = await insertAll(database, 'recipes', [
  fakeRecipeDB({
    userId: authorOne.id,
  }),
  fakeRecipeDB({
    userId: authorTwo.id,
  }),
]);

const [recipeOne, recipeTwo] = defaultRecipes;

describe('create', () => {
  it('Should create a new recipe', async () => {
    const recipe = fakeRecipe({ userId: authorOne.id });

    const createdRecipe = await repository.create(recipe);

    expect(createdRecipe).toEqual({
      id: expect.any(Number),
      ...pick(recipe, recipesKeysPublic),
      author: pick(authorOne, usersKeysPublicWithoutId),
      rating: null,
    });
  });
});

describe('search', () => {
  it('Should return recipes closest to the provided vector', async () => {
    const vectorA = getVector(0.1);
    const vectorB = getVector(0.11);
    const vectorC = getVector(0.9);

    const [recipeClose] = await insertAll(database, 'recipes', [
      fakeRecipe({ userId: authorOne.id, embedding: pgvector.toSql(vectorB) }),
      fakeRecipe({ userId: authorOne.id, embedding: pgvector.toSql(vectorC) }),
    ]);

    const recipes = await repository.search(vectorA, initialPage);

    expect(recipes[0].id).toBe(recipeClose.id);
  });
});

describe('findById', () => {
  it('Should return undefined when there is no recipe', async () => {
    const nonExistantId = recipeOne.id + recipeTwo.id;

    const recipe = await repository.findById(nonExistantId);

    expect(recipe).toBeUndefined();
  });

  it('Should return a recipe', async () => {
    const recipeById = await repository.findById(recipeOne.id);

    expect(recipeById).toEqual({
      ...pick(recipeById, recipesKeysPublic),
      author: pick(authorOne, usersKeysPublicWithoutId),
      ingredients: [],
      tools: [],
      rating: null,
    });
  });

  it('Should return a recipe with an average rating', async () => {
    const [userRaterTwo] = await insertAll(database, 'users', fakeUser());

    const recipeId = recipeOne.id;
    const [ratingOne, ratingTwo] = await insertAll(database, 'ratings', [
      fakeRating({ userId: userRater.id, recipeId }),
      fakeRating({ userId: userRaterTwo.id, recipeId }),
    ]);

    const recipeById = await repository.findById(recipeId);

    expect(recipeById).toHaveProperty(
      'rating',
      (ratingOne.rating + ratingTwo.rating) / 2
    );
  });
});

describe('findCreatedByUser', () => {
  it('Should return an empty array when there is no recipe created by user', async () => {
    const recipes = await repository.findCreatedByUser(
      userRater.id,
      initialPage
    );

    expect(recipes).toEqual([]);
  });

  it('Should return a recipe that user has created', async () => {
    const [createdRecipes] = await insertAll(
      database,
      'recipes',
      fakeRecipeDB({ userId: userRater.id })
    );

    const [createdRecipesByUser] = await repository.findCreatedByUser(
      userRater.id,
      initialPage
    );

    expect(createdRecipesByUser).toEqual({
      ...pick(createdRecipes, recipesKeysPublic),
      author: pick(userRater, usersKeysPublicWithoutId),
      rating: null,
    });
  });

  it('Should return a recipe that user has created with a correct rating', async () => {
    const [createdRecipes] = await insertAll(
      database,
      'recipes',
      fakeRecipeDB({ userId: userRater.id })
    );

    const [ratingOne, ratingTwo] = await insertAll(database, 'ratings', [
      fakeRating({ userId: authorOne.id, recipeId: createdRecipes.id }),
      fakeRating({ userId: authorTwo.id, recipeId: createdRecipes.id }),
    ]);

    const [createdRecipesByUser] = await repository.findCreatedByUser(
      userRater.id,
      initialPage
    );

    expect(createdRecipesByUser).toHaveProperty(
      'rating',
      (ratingOne.rating + ratingTwo.rating) / 2
    );
  });
});

describe('totalCreatedByUser', () => {
  it('Should return 0', async () => {
    await expect(repository.totalCreatedByUser(userRater.id)).resolves.toBe(0);
  });

  it('Should return the amount that was created', async () => {
    const created = await insertAll(database, 'recipes', [
      fakeRecipeDB({ userId: userRater.id }),
      fakeRecipeDB({ userId: userRater.id }),
    ]);

    await expect(repository.totalCreatedByUser(userRater.id)).resolves.toBe(
      created.length
    );
  });
});

describe('findSavedByUser', () => {
  it('Should return an empty array when there is no recipe saved by user', async () => {
    const savedRecipes = await repository.findSavedByUser(
      userRater.id,
      initialPage
    );

    expect(savedRecipes).toEqual([]);
  });

  it('Should return a recipe that user has saved', async () => {
    const [savedRecipes] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: authorOne.id, recipeId: recipeOne.id })
    );

    const [savedRecipesByUser] = await repository.findSavedByUser(
      savedRecipes.userId,
      initialPage
    );

    expect(savedRecipesByUser).toEqual({
      ...pick(recipeOne, recipesKeysPublic),
      author: pick(authorOne, usersKeysPublicWithoutId),
      rating: null,
    });
  });

  it('Should return a recipe that user has saved created with a correct rating', async () => {
    const [savedRecipes] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: authorOne.id, recipeId: recipeOne.id })
    );

    const [ratingOne, ratingTwo] = await insertAll(database, 'ratings', [
      fakeRating({ userId: authorOne.id, recipeId: savedRecipes.recipeId }),
      fakeRating({ userId: authorTwo.id, recipeId: savedRecipes.recipeId }),
    ]);

    const [savedRecipesByUser] = await repository.findSavedByUser(
      savedRecipes.userId,
      initialPage
    );

    expect(savedRecipesByUser).toHaveProperty(
      'rating',
      (ratingOne.rating + ratingTwo.rating) / 2
    );
  });
});

describe('totalSavedByUser', () => {
  it('Should return 0', async () => {
    await expect(repository.totalSavedByUser(userRater.id)).resolves.toBe(0);
  });

  it('Should return the amount that was saved', async () => {
    const saved = await insertAll(database, 'savedRecipes', [
      fakeSavedRecipe({ recipeId: recipeOne.id, userId: userRater.id }),
      fakeSavedRecipe({ recipeId: recipeTwo.id, userId: userRater.id }),
    ]);

    await expect(repository.totalSavedByUser(userRater.id)).resolves.toBe(
      saved.length
    );
  });
});

describe('findByCollectionId', () => {
  it('Should return an empty array when collection has no recipes', async () => {
    const [collection] = await insertAll(
      database,
      'collections',
      fakeCollection({ userId: authorOne.id })
    );

    const recipes = await repository.findByCollectionId(collection.id);

    expect(recipes).toEqual([]);
  });

  it('Should return recipes in a collection', async () => {
    const [collection] = await insertAll(
      database,
      'collections',
      fakeCollection({ userId: authorOne.id })
    );

    const [recipe] = await insertAll(
      database,
      'recipes',
      fakeRecipeDB({ userId: authorOne.id })
    );

    await insertAll(database, 'collectionsRecipes', [
      fakeCollectionRecipe({
        collectionId: collection.id,
        recipeId: recipe.id,
      }),
    ]);

    const recipes = await repository.findByCollectionId(collection.id);

    expect(recipes).toHaveLength(1);
    expect(recipes[0]).toEqual({
      ...pick(recipe, recipesKeysPublic),
      author: pick(authorOne, usersKeysPublicWithoutId),
      rating: null,
    });
  });

  it('Should return recipes with correct ratings', async () => {
    const [collection] = await insertAll(
      database,
      'collections',
      fakeCollection({ userId: authorOne.id })
    );

    const [recipe] = await insertAll(
      database,
      'recipes',
      fakeRecipeDB({ userId: authorOne.id })
    );

    await insertAll(database, 'collectionsRecipes', [
      fakeCollectionRecipe({
        collectionId: collection.id,
        recipeId: recipe.id,
      }),
    ]);

    const [ratingOne, ratingTwo] = await insertAll(database, 'ratings', [
      fakeRating({ userId: authorOne.id, recipeId: recipe.id }),
      fakeRating({ userId: authorTwo.id, recipeId: recipe.id }),
    ]);

    const recipes = await repository.findByCollectionId(collection.id);

    expect(recipes[0]).toHaveProperty(
      'rating',
      (ratingOne.rating + ratingTwo.rating) / 2
    );
  });

  it('Should return multiple recipes ordered by id descending', async () => {
    const [collection] = await insertAll(
      database,
      'collections',
      fakeCollection({ userId: authorOne.id })
    );

    const [recipeOne, recipeTwo, recipeThree] = await insertAll(
      database,
      'recipes',
      [
        fakeRecipeDB({ userId: authorOne.id }),
        fakeRecipeDB({ userId: authorTwo.id }),
        fakeRecipeDB({ userId: authorOne.id }),
      ]
    );

    await insertAll(database, 'collectionsRecipes', [
      fakeCollectionRecipe({
        collectionId: collection.id,
        recipeId: recipeOne.id,
      }),
      fakeCollectionRecipe({
        collectionId: collection.id,
        recipeId: recipeTwo.id,
      }),
      fakeCollectionRecipe({
        collectionId: collection.id,
        recipeId: recipeThree.id,
      }),
    ]);

    const recipes = await repository.findByCollectionId(collection.id);

    expect(recipes).toHaveLength(3);

    // Ordered by id descending (newest first)
    expect(recipes[0].id).toBe(recipeThree.id);
    expect(recipes[1].id).toBe(recipeTwo.id);
    expect(recipes[2].id).toBe(recipeOne.id);
  });

  it('Should only return recipes from the specified collection', async () => {
    const [collectionOne, collectionTwo] = await insertAll(
      database,
      'collections',
      [
        fakeCollection({ userId: authorOne.id }),
        fakeCollection({ userId: authorTwo.id }),
      ]
    );

    const [recipeInCollectionOne, recipeInCollectionTwo] = await insertAll(
      database,
      'recipes',
      [
        fakeRecipeDB({ userId: authorOne.id }),
        fakeRecipeDB({ userId: authorTwo.id }),
      ]
    );

    await insertAll(database, 'collectionsRecipes', [
      fakeCollectionRecipe({
        collectionId: collectionOne.id,
        recipeId: recipeInCollectionOne.id,
      }),
      fakeCollectionRecipe({
        collectionId: collectionTwo.id,
        recipeId: recipeInCollectionTwo.id,
      }),
    ]);

    const recipesInCollectionOne = await repository.findByCollectionId(
      collectionOne.id
    );

    expect(recipesInCollectionOne).toHaveLength(1);
    expect(recipesInCollectionOne[0].id).toBe(recipeInCollectionOne.id);
  });
});

describe('findAll', () => {
  it('Should return all recipes', async () => {
    const recipes = await repository.findAll(initialPageWithSort);

    expect(recipes).toHaveLength(defaultRecipes.length);
  });

  it('Should return 5 recipes newest recipes', async () => {
    await insertAll(database, 'recipes', [
      fakeRecipeDB({
        userId: authorOne.id,
      }),
      fakeRecipeDB({
        userId: authorOne.id,
      }),
      fakeRecipeDB({
        userId: authorOne.id,
      }),
      fakeRecipeDB({
        userId: authorOne.id,
      }),
    ]);

    const usersNotFromRepo = (await selectAll(
      database,
      'users'
    )) as UsersPublic[];

    const recipesNotFromRepo = (await selectAll(
      database,
      'recipes'
    )) as RecipesPublicWithoutRating[];
    recipesNotFromRepo.sort((a, b) => b.id - a.id);

    const recipesNotFromRepoWithAuthor = recipesNotFromRepo.map(recipe => ({
      ...omit(recipe, 'embedding'),
      author: pick(
        usersNotFromRepo.find(user => user.id === recipe.userId),
        usersKeysPublicWithoutId
      ),
      rating: null,
    }));

    const recipesFromRepo = await repository.findAll(initialPageWithSort);

    expect(recipesFromRepo).toHaveLength(initialPageWithSort.limit);
    expect(recipesFromRepo).toEqual(recipesNotFromRepoWithAuthor.slice(0, 5));
  });

  it('Should return 5 oldest recipes', async () => {
    await insertAll(database, 'recipes', [
      fakeRecipeDB({
        userId: authorOne.id,
      }),
      fakeRecipeDB({
        userId: authorOne.id,
      }),
      fakeRecipeDB({
        userId: authorOne.id,
      }),
      fakeRecipeDB({
        userId: authorOne.id,
      }),
    ]);

    const usersNotFromRepo = (await selectAll(
      database,
      'users'
    )) as UsersPublic[];

    const recipesNotFromRepo = (await selectAll(
      database,
      'recipes'
    )) as RecipesPublicWithoutRating[];
    recipesNotFromRepo.sort((a, b) => a.id - b.id);

    const recipesNotFromRepoWithAuthor = recipesNotFromRepo.map(recipe => ({
      ...omit(recipe, 'embedding'),
      author: pick(
        usersNotFromRepo.find(user => user.id === recipe.userId),
        usersKeysPublicWithoutId
      ),
      rating: null,
    }));

    const recipesFromRepo = await repository.findAll({
      ...initialPageWithSort,
      sort: SortingTypes.OLDEST,
    });

    expect(recipesFromRepo).toHaveLength(initialPageWithSort.limit);
    expect(recipesFromRepo).toEqual(recipesNotFromRepoWithAuthor.slice(0, 5));
  });

  it('Should return 5 highest rated recipes', async () => {
    const [recipeThree, recipeFour, recipeFive, recipeSix] = await insertAll(
      database,
      'recipes',
      [
        fakeRecipe({ userId: authorOne.id, embedding: null }),
        fakeRecipe({ userId: authorOne.id, embedding: null }),
        fakeRecipe({ userId: authorOne.id, embedding: null }),
        fakeRecipe({ userId: authorOne.id, embedding: null }),
      ]
    );

    const [ratedThree, ratedFour, ratedFive, ratedSix] = await insertAll(
      database,
      'ratings',
      [
        fakeRating({
          recipeId: recipeThree.id,
          userId: userRater.id,
          rating: 5,
        }),
        fakeRating({
          recipeId: recipeFour.id,
          userId: userRater.id,
          rating: 4,
        }),
        fakeRating({
          recipeId: recipeFive.id,
          userId: userRater.id,
          rating: 3,
        }),
        fakeRating({ recipeId: recipeSix.id, userId: userRater.id, rating: 2 }),
      ]
    );

    const recipesFromRepo = await repository.findAll({
      ...initialPageWithSort,
      sort: SortingTypes.HIGHEST_RATING,
    });

    expect(recipesFromRepo).toHaveLength(initialPageWithSort.limit);
    expect(recipesFromRepo[0]).toMatchObject({
      ...omit(recipeThree, 'embedding'),
      rating: ratedThree.rating,
    });

    expect(recipesFromRepo[1]).toMatchObject({
      ...omit(recipeFour, 'embedding'),
      rating: ratedFour.rating,
    });

    expect(recipesFromRepo[2]).toMatchObject({
      ...omit(recipeFive, 'embedding'),
      rating: ratedFive.rating,
    });

    expect(recipesFromRepo[3]).toMatchObject({
      ...omit(recipeSix, 'embedding'),
      rating: ratedSix.rating,
    });

    expect(recipesFromRepo[4]).toMatchObject({
      rating: null,
    });
  });

  it('Should return 5 lowest rated recipes', async () => {
    const [recipeThree, recipeFour, recipeFive, recipeSix] = await insertAll(
      database,
      'recipes',
      [
        fakeRecipe({ userId: authorOne.id, embedding: null }),
        fakeRecipe({ userId: authorOne.id, embedding: null }),
        fakeRecipe({ userId: authorOne.id, embedding: null }),
        fakeRecipe({ userId: authorOne.id, embedding: null }),
      ]
    );

    const [ratedThree, ratedFour, ratedFive, ratedSix] = await insertAll(
      database,
      'ratings',
      [
        fakeRating({
          recipeId: recipeThree.id,
          userId: userRater.id,
          rating: 1,
        }),
        fakeRating({
          recipeId: recipeFour.id,
          userId: userRater.id,
          rating: 2,
        }),
        fakeRating({
          recipeId: recipeFive.id,
          userId: userRater.id,
          rating: 3,
        }),
        fakeRating({ recipeId: recipeSix.id, userId: userRater.id, rating: 4 }),
      ]
    );

    const recipesFromRepo = await repository.findAll({
      ...initialPageWithSort,
      sort: SortingTypes.LOWEST_RATING,
    });

    expect(recipesFromRepo).toHaveLength(initialPageWithSort.limit);
    expect(recipesFromRepo[0]).toMatchObject({
      ...omit(recipeThree, 'embedding'),
      rating: ratedThree.rating,
    });

    expect(recipesFromRepo[1]).toMatchObject({
      ...omit(recipeFour, 'embedding'),
      rating: ratedFour.rating,
    });

    expect(recipesFromRepo[2]).toMatchObject({
      ...omit(recipeFive, 'embedding'),
      rating: ratedFive.rating,
    });

    expect(recipesFromRepo[3]).toMatchObject({
      ...omit(recipeSix, 'embedding'),
      rating: ratedSix.rating,
    });

    expect(recipesFromRepo[4]).toMatchObject({
      rating: null,
    });
  });
});

describe('totalCount', () => {
  it('Should return correct count', async () => {
    await expect(repository.totalCount()).resolves.toBe(defaultRecipes.length);
  });
});

describe('isAuthor', () => {
  it('Should return true', async () => {
    const isAuthor = await repository.isAuthor(recipeOne.id, authorOne.id);

    expect(isAuthor).toBeTruthy();
  });

  it('Should return false', async () => {
    const isAuthor = await repository.isAuthor(recipeOne.id, authorTwo.id);

    expect(isAuthor).toBeFalsy();
  });
});

describe('remove', () => {
  it('Should remove a recipe with a rating null', async () => {
    const removedRecipe = await repository.remove(recipeOne.id);

    expect(removedRecipe).toEqual({
      ...pick(removedRecipe, recipesKeysPublic),
      author: pick(authorOne, usersKeysPublicWithoutId),
      rating: null,
    });
  });

  it('Should remove a recipe with correct rating', async () => {
    const recipeId = recipeOne.id;

    const [ratingOne, ratingTwo] = await insertAll(database, 'ratings', [
      fakeRating({ userId: authorOne.id, recipeId }),
      fakeRating({ userId: authorTwo.id, recipeId }),
    ]);

    const removedRecipe = await repository.remove(recipeId);

    expect(removedRecipe).toEqual({
      ...pick(removedRecipe, recipesKeysPublic),
      author: pick(authorOne, usersKeysPublicWithoutId),
      rating: (ratingOne.rating + ratingTwo.rating) / 2,
    });
  });

  it('Should throw an error if recipe does not exist', async () => {
    const nonExistantId = recipeOne.id + recipeTwo.id;

    await expect(repository.remove(nonExistantId)).rejects.toThrowError(
      NoResultError
    );
  });
});
