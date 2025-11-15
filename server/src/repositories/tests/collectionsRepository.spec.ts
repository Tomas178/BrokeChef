import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { fakeCollection, fakeUser } from '@server/entities/tests/fakes';
import { collectionsKeysPublic } from '@server/entities/collections';
import { pick } from 'lodash-es';
import { insertAll } from '@tests/utils/record';
import { NoResultError } from 'kysely';
import { collectionsRepository } from '../collectionsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = collectionsRepository(database);

const [userOne, userTwo] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const fakeCollectionDefault = (
  collection: Parameters<typeof fakeCollection>[0] = {}
) =>
  fakeCollection({
    userId: userOne.id,
    ...collection,
  });

describe('create', () => {
  const collectionTitle = 'My Favorite Recipes';

  it('Should throw an error when creating a collection with duplicate title for the same user', async () => {
    await repository.create(fakeCollectionDefault({ title: collectionTitle }));

    await expect(
      repository.create(fakeCollectionDefault({ title: collectionTitle }))
    ).rejects.toThrow(/duplicate|unique/i);
  });

  it('Should allow collections with same title for different users', async () => {
    await repository.create(fakeCollectionDefault({ title: collectionTitle }));

    const collection = await repository.create(
      fakeCollection({ userId: userTwo.id, title: collectionTitle })
    );

    expect(collection).toMatchObject({
      userId: userTwo.id,
      title: collectionTitle,
    });
  });

  it('Should create a new collection', async () => {
    const collection = fakeCollectionDefault();

    const createdCollection = await repository.create(collection);

    expect(createdCollection).toEqual({
      id: expect.any(Number),
      ...pick(collection, collectionsKeysPublic),
    });
  });
});

describe('totalCollectionsByUser', () => {
  it('Should return 0 when user has no collections', async () => {
    const [userTwo] = await insertAll(database, 'users', fakeUser());

    await expect(repository.totalCollectionsByUser(userTwo.id)).resolves.toBe(
      0
    );
  });

  it('Should return the amount that was created', async () => {
    const createdCollections = await insertAll(database, 'collections', [
      fakeCollection({ userId: userOne.id }),
      fakeCollection({ userId: userOne.id }),
    ]);

    await expect(repository.totalCollectionsByUser(userOne.id)).resolves.toBe(
      createdCollections.length
    );
  });
});

describe('Remove', () => {
  it('Should throw an error if collection does not exist', async () => {
    const nonExistantCollectionId = 999_999;

    await expect(
      repository.remove(nonExistantCollectionId)
    ).rejects.toThrowError(NoResultError);
  });

  it('Should remove the collection', async () => {
    const [collection] = await insertAll(database, 'collections', [
      fakeCollection({ userId: userOne.id }),
    ]);

    await repository.remove(collection.id);

    await expect(repository.remove(collection.id)).rejects.toThrowError(
      NoResultError
    );
  });
});
