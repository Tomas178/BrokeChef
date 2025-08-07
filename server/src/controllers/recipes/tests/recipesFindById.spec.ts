import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user, userOther] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipe, recipeOther] = await insertAll(database, 'recipes', [
  fakeRecipe({ userId: user.id }),
  fakeRecipe({ userId: userOther.id }),
]);

const { findById } = createCaller({ db: database });

it('Should return a recipe', async () => {
  const recipeResponse = await findById(recipe.id);

  expect(recipeResponse).toMatchObject(recipe);
});

it('Should throw an error if the recipe does not exist', async () => {
  const nonExistantId = recipe.id + recipeOther.id;

  await expect(findById(nonExistantId)).rejects.toThrow(/not found/i);
});
