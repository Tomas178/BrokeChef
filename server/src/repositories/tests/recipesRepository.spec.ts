import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import {
  recipesKeysPublic,
  type RecipesPublic,
} from '@server/entities/recipes';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';
import { initialPage } from '@server/shared/pagination';
import { recipesRepository } from '../recipesRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = recipesRepository(database);

const [userOne, userTwo, userThree] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
  fakeUser(),
]);

const defaultRecipes = await insertAll(database, 'recipes', [
  fakeRecipe({
    userId: userOne.id,
  }),
  fakeRecipe({
    userId: userTwo.id,
  }),
]);

const [recipeOne, recipeTwo] = defaultRecipes;

const fakeRecipeDefault = (recipe: Parameters<typeof fakeRecipe>[0] = {}) =>
  fakeRecipe({
    userId: userOne.id,
    ...recipe,
  });

describe('create', () => {
  it('Should create a new recipe', async () => {
    const recipe = fakeRecipeDefault();

    const createdRecipe = await repository.create(recipe);

    expect(createdRecipe).toEqual({
      id: expect.any(Number),
      ...pick(recipe, recipesKeysPublic),
      author: pick(userOne, usersKeysPublic),
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
      author: pick(userOne, usersKeysPublic),
    });
  });
});

describe('findCreated', () => {
  it('Should return an empty array when there is no recipe created by user', async () => {
    const recipes = await repository.findCreated(userThree.id, initialPage);

    expect(recipes).toEqual([]);
  });

  it('Should return a recipe that user has created', async () => {
    const [createdRecipes] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: userThree.id })
    );

    const [createdRecipesByUser] = await repository.findCreated(
      userThree.id,
      initialPage
    );

    expect(createdRecipesByUser).toEqual({
      ...pick(createdRecipes, recipesKeysPublic),
      author: pick(userThree, usersKeysPublic),
    });
  });
});

describe('findSaved', () => {
  it('Should return an empty array when there is no recipe saved by user', async () => {
    const savedRecipes = await repository.findSaved(userThree.id, initialPage);

    expect(savedRecipes).toEqual([]);
  });

  it('Should return a recipe that user has saved', async () => {
    const [savedRecipes] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: userOne.id, recipeId: recipeOne.id })
    );

    const [savedRecipesByUser] = await repository.findSaved(
      savedRecipes.userId,
      initialPage
    );

    expect(savedRecipesByUser).toEqual({
      ...pick(recipeOne, recipesKeysPublic),
      author: pick(userOne, usersKeysPublic),
    });
  });
});

describe('findAll', () => {
  it('Should return all recipes', async () => {
    const recipes = await repository.findAll(initialPage);

    expect(recipes).toHaveLength(defaultRecipes.length);
  });

  it('Should return 5 recipes ordered descendingly by ID', async () => {
    await insertAll(database, 'recipes', [
      fakeRecipe({
        userId: userOne.id,
      }),
      fakeRecipe({
        userId: userOne.id,
      }),
      fakeRecipe({
        userId: userOne.id,
      }),
      fakeRecipe({
        userId: userOne.id,
      }),
    ]);

    const usersNotFromRepo = (await selectAll(
      database,
      'users'
    )) as UsersPublic[];

    const recipesNotFromRepo = (await selectAll(
      database,
      'recipes'
    )) as RecipesPublic[];
    recipesNotFromRepo.sort((a, b) => b.id - a.id);

    const recipesNotFromRepoWithAuthor = recipesNotFromRepo.map(recipe => ({
      ...recipe,
      author: pick(
        usersNotFromRepo.find(user => user.id === recipe.userId),
        usersKeysPublic
      ),
    }));

    const recipesFromRepo = await repository.findAll(initialPage);

    expect(recipesFromRepo).toHaveLength(5);
    expect(recipesFromRepo).toEqual(recipesNotFromRepoWithAuthor.slice(0, 5));
  });
});

describe('isAuthor', () => {
  it('Should return true', async () => {
    const isAuthor = await repository.isAuthor(recipeOne.id, userOne.id);

    expect(isAuthor).toBeTruthy();
  });

  it('Should return false', async () => {
    const isAuthor = await repository.isAuthor(recipeOne.id, userTwo.id);

    expect(isAuthor).toBeFalsy();
  });
});

describe('delete', () => {
  it('Should delete a recipe', async () => {
    const deletedRecipe = await repository.remove(recipeOne.id);

    expect(deletedRecipe).toEqual({
      ...pick(deletedRecipe, recipesKeysPublic),
      author: pick(userOne, usersKeysPublic),
    });
  });

  it('Should throw an error if recipe does not exist', async () => {
    const nonExistantId = recipeOne.id + recipeTwo.id;

    await expect(repository.remove(nonExistantId)).rejects.toThrow();
  });
});
