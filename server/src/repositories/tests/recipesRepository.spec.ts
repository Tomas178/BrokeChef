import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import {
  recipesKeysPublic,
  type RecipesPublic,
} from '@server/entities/recipes';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';
import { recipesRepository } from '../recipesRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = recipesRepository(database);

const [userOne, userTwo] = await insertAll(database, 'users', [
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

const initialPage = {
  offset: 0,
  limit: 10,
};

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
    const maxId = Math.max(recipeOne.id, recipeTwo.id);
    const invalidId = maxId + 1;

    const recipe = await repository.findById(invalidId);

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

    const recipesFromRepo = await repository.findAll({ offset: 0, limit: 5 });

    expect(recipesFromRepo).toHaveLength(5);
    expect(recipesFromRepo).toEqual(recipesNotFromRepoWithAuthor.slice(0, 5));
  });
});
