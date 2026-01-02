import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeIngredient,
  fakeRecipeDB,
  fakeUser,
} from '@server/entities/tests/fakes';
import { recipesIngredientsRepository } from '../recipesIngredientsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = recipesIngredientsRepository(database);

const [user] = await insertAll(database, 'users', [fakeUser()]);
const [recipe] = await insertAll(database, 'recipes', [
  fakeRecipeDB({ userId: user.id }),
]);
const [ingredientOne, ingredientTwo] = await insertAll(
  database,
  'ingredients',
  [fakeIngredient(), fakeIngredient()]
);

describe('create', () => {
  it('Should create a new single link', async () => {
    const newLink = [
      {
        recipeId: recipe.id,
        ingredientId: ingredientOne.id,
      },
    ];

    const createdLink = await repository.create(newLink);

    expect(createdLink).toEqual(newLink);
  });

  it('Should create new multiple links', async () => {
    const newLinks = [
      { recipeId: recipe.id, ingredientId: ingredientOne.id },
      {
        recipeId: recipe.id,
        ingredientId: ingredientTwo.id,
      },
    ];

    const createdLinks = await repository.create(newLinks);

    expect(createdLinks).toEqual(newLinks);
  });
});

describe('findByRecipeId', () => {
  it('Should return undefined by given recipe ID', async () => {
    const linkByRecipeId = await repository.findByRecipeId(recipe.id + 1);

    expect(linkByRecipeId).toBeUndefined();
  });

  it('Should return a link', async () => {
    await insertAll(database, 'recipesIngredients', [
      { recipeId: recipe.id, ingredientId: ingredientOne.id },
    ]);

    const linkByRecipeId = await repository.findByRecipeId(recipe.id);

    expect(linkByRecipeId).toEqual({
      recipeId: recipe.id,
      ingredientId: ingredientOne.id,
    });
  });
});
