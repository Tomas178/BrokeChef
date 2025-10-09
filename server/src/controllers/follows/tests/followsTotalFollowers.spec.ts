import type { FollowsService } from '@server/services/followsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { authContext, requestContext } from '@tests/utils/context';
import { fakeUser } from '@server/entities/tests/fakes';
import followsRouter from '..';

const mockTotalFollowers = vi.fn();

const mockFollowsService: Partial<FollowsService> = {
  totalFollowers: mockTotalFollowers,
};

vi.mock('@server/services/followsService', () => ({
  followsService: () => mockFollowsService,
}));

const userFollower = fakeUser();

const createCaller = createCallerFactory(followsRouter);
const database = {} as Database;

beforeEach(() => mockTotalFollowers.mockReset());

describe('Unauthenticated tests', () => {
  const { totalFollowers } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(totalFollowers(userFollower.id)).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { totalFollowers } = createCaller(
    authContext({ database }, userFollower)
  );

  afterEach(() => expect(mockTotalFollowers).toHaveBeenCalledOnce());

  describe('Checking currently logged in user', () => {
    it('Should return 0 if user is not followed by anyone', async () => {
      const zero = 0;

      mockTotalFollowers.mockResolvedValueOnce(zero);

      await expect(totalFollowers()).resolves.toBe(zero);
    });

    it('Should return 2 if user is followed by 2 other users', async () => {
      const two = 2;

      mockTotalFollowers.mockResolvedValueOnce(two);

      await expect(totalFollowers()).resolves.toBe(two);
    });
  });

  describe('Checking other user (not by cookies)', () => {
    it('Should return 0 if user is not followed by anyone', async () => {
      const zero = 0;

      mockTotalFollowers.mockResolvedValueOnce(zero);

      await expect(totalFollowers(userFollower.id)).resolves.toBe(zero);
    });

    it('Should return 2 if user is followed by 2 other users', async () => {
      const two = 2;

      mockTotalFollowers.mockResolvedValueOnce(two);

      await expect(totalFollowers(userFollower.id)).resolves.toBe(two);
    });
  });
});
