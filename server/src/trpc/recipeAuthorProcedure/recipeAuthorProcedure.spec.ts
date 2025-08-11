import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext } from '@tests/utils/context';
import { createCallerFactory, router } from '..';
import { recipeAuthorProcedure } from '.';

const routes = router({
  testCall: recipeAuthorProcedure.query(() => 'passed'),
});

const database = await wrapInRollbacks(createTestDatabase());

const [userOne, userTwo] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipeOne, recipeTwo] = await insertAll(database, 'recipes', [
  fakeRecipe({ userId: userOne.id }),
  fakeRecipe({ userId: userTwo.id }),
]);

const createCaller = createCallerFactory(routes);
const authenticated = createCaller(authContext({ db: database }, userOne));

it('Should pass ir recipe belongs to the user', async () => {
  const response = await authenticated.testCall(recipeOne.id);

  expect(response).toEqual('passed');
});

it('Should throw an error if recipeId is not provided', async () => {
  await expect((authenticated.testCall as any)({})).rejects.toThrow(/id/i);
});

it('Should throw an error if user provides a non-existing recipeId', async () => {
  const nonExistantRecipeId = recipeOne.id + recipeTwo.id;

  await expect(authenticated.testCall(nonExistantRecipeId)).rejects.toThrow(
    /recipe/i
  );
});

it('Should throw an error if user provides undefined recipeId', async () => {
  await expect(
    (authenticated.testCall as any)({ recipeId: undefined })
  ).rejects.toThrow(/id/i);
});

it('Should throw an error if recipe does not belong to the user', async () => {
  await expect(authenticated.testCall(recipeTwo.id)).rejects.toThrow(/recipe/i);
});
