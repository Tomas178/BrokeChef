import { createCallerFactory } from '@server/trpc';
import recipesRouter from '..';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext } from '@tests/utils/context';

const createCaller = createCallerFactory(recipesRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [user, userOther] = await insertAll(db, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipe, recipeOther] = await insertAll(db, 'recipes', [
  fakeRecipe({ userId: user.id }),
  fakeRecipe({ userId: userOther.id }),
]);

const { findById } = createCaller(authContext({ db }, user));

it('Should return a recipe', async () => {
  const recipeResponse = await findById(recipe.id);

  expect(recipeResponse).toMatchObject(recipe);
});

it('Should throw an error if the recipe does not exist', async () => {
  const nonExistantId = recipe.id + recipeOther.id;

  await expect(findById(nonExistantId)).rejects.toThrow(/not found/i);
});
