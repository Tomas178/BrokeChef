import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeCollection, fakeUser } from '@server/entities/tests/fakes';
import { authContext } from '@tests/utils/context';
import { createCallerFactory, router } from '..';
import { collectionAuthorProcedure } from '.';

const routes = router({
  testCall: collectionAuthorProcedure.query(() => 'passed'),
});

const database = await wrapInRollbacks(createTestDatabase());

const [userOne, userTwo] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [collectionOne, collectionTwo] = await insertAll(
  database,
  'collections',
  [
    fakeCollection({ userId: userOne.id }),
    fakeCollection({ userId: userTwo.id }),
  ]
);

const createCaller = createCallerFactory(routes);
const authenticated = createCaller(authContext({ database }, userOne));

it('Should pass if collection belongs to the user', async () => {
  const response = await authenticated.testCall({ id: collectionOne.id });

  expect(response).toEqual('passed');
});

it('Should throw an error if collectionId is not provided', async () => {
  await expect((authenticated.testCall as any)({})).rejects.toThrow(/id/i);
});

it('Should throw an error if user provides a non-existing collectionId', async () => {
  const nonExistantCollectionId = collectionOne.id + collectionTwo.id;

  await expect(
    authenticated.testCall({ id: nonExistantCollectionId })
  ).rejects.toThrow(/collection/i);
});

it('Should throw an error if user provides undefined collectionId', async () => {
  await expect(
    (authenticated.testCall as any)({ collectionId: undefined })
  ).rejects.toThrow(/id/i);
});

it('Should throw an error if collection does not belong to the user', async () => {
  await expect(
    authenticated.testCall({ id: collectionTwo.id })
  ).rejects.toThrow(/collection/i);
});
