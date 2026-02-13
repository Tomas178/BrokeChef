import type { FollowsService } from '@server/services/followsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import type { Mock } from 'vitest';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import followsRouter from '..';

const mockTotalFollowing = vi.fn() as Mock<FollowsService['totalFollowing']>;

const mockFollowsService: Partial<FollowsService> = {
  totalFollowing: mockTotalFollowing,
};

vi.mock('@server/services/followsService', () => ({
  followsService: () => mockFollowsService,
}));

const createCaller = createCallerFactory(followsRouter);
const database = {} as Database;

const userFollower = fakeUser();

beforeEach(() => mockTotalFollowing.mockReset());

describe('Unauthenticated tests', () => {
  const { totalFollowing } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(totalFollowing({ userId: userFollower.id })).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { totalFollowing } = createCaller(
    authContext({ database }, userFollower)
  );

  afterEach(() => expect(mockTotalFollowing).toHaveBeenCalledOnce());

  describe('Checking currently logged in user', () => {
    it('Should return 0 if user is not following anyone', async () => {
      const zero = 0;

      mockTotalFollowing.mockResolvedValueOnce(zero);

      await expect(totalFollowing()).resolves.toBe(zero);
    });

    it('Should return 2 if user is following 2 other users', async () => {
      const two = 2;

      mockTotalFollowing.mockResolvedValueOnce(two);

      await expect(totalFollowing()).resolves.toBe(two);
    });
  });

  describe('Checking other user (not by cookies)', () => {
    it('Should return 0 if user is not following anyone', async () => {
      const zero = 0;

      mockTotalFollowing.mockResolvedValueOnce(zero);

      await expect(totalFollowing({ userId: userFollower.id })).resolves.toBe(
        zero
      );
    });

    it('Should return 2 if user is following 2 other users', async () => {
      const two = 2;

      mockTotalFollowing.mockResolvedValueOnce(two);

      await expect(totalFollowing({ userId: userFollower.id })).resolves.toBe(
        two
      );
    });
  });
});
