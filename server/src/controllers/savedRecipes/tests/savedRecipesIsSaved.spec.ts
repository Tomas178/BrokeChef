import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { authContext, requestContext } from '@tests/utils/context';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import savedRecipesRouter from '..';

const createCaller = createCallerFactory(savedRecipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [userSaved, userNotSaved] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: userSaved.id })
);

it('Should return false if no user id is provided', async () => {
  const { isSaved } = createCaller(requestContext({ db: database }));

  await expect(isSaved(recipe.id)).resolves.toBeFalsy();
});

it('Should return false if user has not saved the recipe', async () => {
  const { isSaved } = createCaller(authContext({ db: database }, userNotSaved));

  await expect(isSaved(recipe.id)).resolves.toBeFalsy();
});

it('Should return true if user has saved the recipe', async () => {
  const [savedRecipes] = await insertAll(database, 'savedRecipes', [
    fakeSavedRecipe({ userId: userSaved.id, recipeId: recipe.id }),
  ]);

  const { isSaved } = createCaller(authContext({ db: database }, userSaved));

  await expect(isSaved(savedRecipes.recipeId)).resolves.toBeTruthy();
});
