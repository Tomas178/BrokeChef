import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { authContext, requestContext } from '@tests/utils/callers';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import savedRecipesRouter from '..';

const createCaller = createCallerFactory(savedRecipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [userCreator, userOneSaver, userTwoSaver] = await insertAll(
  database,
  'users',
  [fakeUser(), fakeUser(), fakeUser()]
);

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: userCreator.id })
);

const [savedRecipe] = await insertAll(
  database,
  'savedRecipes',
  fakeSavedRecipe({ userId: userOneSaver.id, recipeId: recipe.id })
);

const { unsave } = createCaller(authContext({ database }, userOneSaver));

it('Should throw an error if user is not authenticated', async () => {
  const { unsave } = createCaller(requestContext({ database }));

  await expect(unsave(1)).rejects.toThrow(/unauthenticated/i);
});

it('Should throw an error if recipe is not found', async () => {
  const nonExistantId = recipe.id + 1;
  await expect(unsave(nonExistantId)).rejects.toThrow(/not found/i);
});

it('Should throw an error if author is saved recipe record is not found', async () => {
  const { unsave } = createCaller(authContext({ database }, userTwoSaver));

  await expect(unsave(recipe.id)).rejects.toThrow(/not found/i);
});

it('Should unsave a recipe', async () => {
  const unsavedRecipe = await unsave(savedRecipe.recipeId);

  expect(unsavedRecipe).toEqual(savedRecipe);
});
