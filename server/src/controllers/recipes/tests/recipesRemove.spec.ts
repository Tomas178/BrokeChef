import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext } from '@tests/utils/context';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublic } from '@server/entities/users';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: user.id })
);

const { remove } = createCaller(authContext({ db: database }, user));

it('Should remove a recipe', async () => {
  const removedRecipe = await remove(recipe.id);

  expect(removedRecipe).toEqual({
    ...pick(recipe, recipesKeysPublic),
    author: pick(user, usersKeysPublic),
  });
});

it('Should throw an error if recipe does not exist', async () => {
  const nonExistantId = recipe.id + 1;

  await expect(remove(nonExistantId)).rejects.toThrow(/not found/i);
});
