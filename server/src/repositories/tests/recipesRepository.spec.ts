import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { clearTables, insertAll, selectAll } from '@tests/utils/record';
import {
  fakeRating,
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import {
  recipesKeysPublic,
  type RecipesPublicWithoutRating,
} from '@server/entities/recipes';
import {
  usersKeysPublicWithoutId,
  type UsersPublic,
} from '@server/entities/users';
import { initialPage, initialPageWithSort } from '@server/entities/shared';
import { recipesRepository } from '../recipesRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = recipesRepository(database);

await clearTables(database, ['recipes', 'tools', 'ingredients']);

const [authorOne, authorTwo, userRater] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
  fakeUser(),
]);

const defaultRecipes = await insertAll(database, 'recipes', [
  fakeRecipe({
    userId: authorOne.id,
  }),
  fakeRecipe({
    userId: authorTwo.id,
  }),
]);

const [recipeOne, recipeTwo] = defaultRecipes;

const fakeRecipeDefault = (recipe: Parameters<typeof fakeRecipe>[0] = {}) =>
  fakeRecipe({
    userId: authorOne.id,
    ...recipe,
  });

describe('create', () => {
  it('Should create a new recipe', async () => {
    const recipe = fakeRecipeDefault();

    const createdRecipe = await repository.create(recipe);

    expect(createdRecipe).toEqual({
      id: expect.any(Number),
      ...pick(recipe, recipesKeysPublic),
      author: pick(authorOne, usersKeysPublicWithoutId),
      rating: null,
    });
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
      fakeRecipe({ userId: userRater.id })
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
      fakeRecipe({ userId: userRater.id })
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
      fakeRecipe({ userId: userRater.id }),
      fakeRecipe({ userId: userRater.id }),
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

describe('findAll', () => {
  it('Should return all recipes', async () => {
    const recipes = await repository.findAll(initialPageWithSort);

    expect(recipes).toHaveLength(defaultRecipes.length);
  });

  it('Should return 5 recipes ordered descendingly by ID', async () => {
    await insertAll(database, 'recipes', [
      fakeRecipe({
        userId: authorOne.id,
      }),
      fakeRecipe({
        userId: authorOne.id,
      }),
      fakeRecipe({
        userId: authorOne.id,
      }),
      fakeRecipe({
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
      ...recipe,
      author: pick(
        usersNotFromRepo.find(user => user.id === recipe.userId),
        usersKeysPublicWithoutId
      ),
    }));

    const recipesFromRepo = await repository.findAll(initialPageWithSort);

    expect(recipesFromRepo).toHaveLength(5);
    expect(recipesFromRepo).toEqual(recipesNotFromRepoWithAuthor.slice(0, 5));
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

    await expect(repository.remove(nonExistantId)).rejects.toThrow(
      /recipe.*not found|not found.*recipe/i
    );
  });
});
