import { createCallerFactory } from '@server/trpc';
import recipesRouter from '..';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext } from '@tests/utils/context';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublic } from '@server/entities/users';

const createCaller = createCallerFactory(recipesRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(db, 'users', fakeUser());

const [recipe] = await insertAll(
  db,
  'recipes',
  fakeRecipe({ userId: user.id })
);

const { remove } = createCaller(authContext({ db }, user));

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
