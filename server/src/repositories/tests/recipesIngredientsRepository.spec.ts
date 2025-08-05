import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeIngredient,
  fakeRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { recipesIngredientsRepository } from '../recipesIngredientsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = recipesIngredientsRepository(database);

const [user] = await insertAll(database, 'users', [fakeUser()]);
const [recipe] = await insertAll(database, 'recipes', [
  fakeRecipe({ userId: user.id }),
]);
const [ingredient] = await insertAll(database, 'ingredients', [
  fakeIngredient(),
]);

describe('create', () => {
  it('Should create a new link in recipesIngredients table', async () => {
    const createdLink = await repository.create({
      recipeId: recipe.id,
      ingredientId: ingredient.id,
    });

    expect(createdLink).toEqual({
      recipeId: recipe.id,
      ingredientId: ingredient.id,
    });
  });
});

describe('findByRecipeId', () => {
  it('Should return undefined by given recipe ID', async () => {
    const linkByRecipeId = await repository.findByRecipeId(recipe.id + 1);

    expect(linkByRecipeId).toBeUndefined();
  });

  it('Should return a link', async () => {
    await insertAll(database, 'recipesIngredients', [
      { recipeId: recipe.id, ingredientId: ingredient.id },
    ]);

    const linkByRecipeId = await repository.findByRecipeId(recipe.id);

    expect(linkByRecipeId).toEqual({
      recipeId: recipe.id,
      ingredientId: ingredient.id,
    });
  });
});
