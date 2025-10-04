import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRating, fakeUser } from '@server/entities/tests/fakes';
import { requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import ratingsRouter from '..';

const mockCreate = vi.fn();

vi.mock('@server/services/ratingsService', async importActual => {
  const actual =
    await importActual<typeof import('@server/services/ratingsService')>();

  return {
    ...actual,
    ratingsService: (database_: Database) => ({
      ...actual.ratingsService(database_),
      create: mockCreate,
    }),
  };
});

const createCaller = createCallerFactory(ratingsRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [userAuthor, userRater] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

beforeEach(() => mockCreate.mockReset());

it('Should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ database }));

  await expect(create(fakeRating())).rejects.toThrow(/unauthenticated/i);
});
