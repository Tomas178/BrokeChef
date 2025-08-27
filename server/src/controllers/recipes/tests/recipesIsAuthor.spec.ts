import { createCallerFactory } from '@server/trpc';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { authContext, requestContext } from '@tests/utils/context';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [userAuthor, userNotAuthor] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: userAuthor.id })
);

it('Should return false if no user id is provided', async () => {
  const { isAuthor } = createCaller(requestContext({ db: database }));

  await expect(isAuthor(recipe.id)).resolves.toBeFalsy();
});

it('Should return false if user is not an author', async () => {
  const { isAuthor } = createCaller(
    authContext({ db: database }, userNotAuthor)
  );

  await expect(isAuthor(recipe.id)).resolves.toBeFalsy();
});

it('Should return true if user is an author', async () => {
  const { isAuthor } = createCaller(authContext({ db: database }, userAuthor));

  await expect(isAuthor(recipe.id)).resolves.toBeTruthy();
});
