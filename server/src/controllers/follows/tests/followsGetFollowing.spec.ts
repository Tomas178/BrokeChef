import type { FollowsService } from '@server/services/followsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeUserPublic } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import followsRouter from '..';

const mockGetFollowing = vi.fn();

const mockFollowsService: Partial<FollowsService> = {
  getFollowing: mockGetFollowing,
};

vi.mock('@server/services/followsService', () => ({
  followsService: () => mockFollowsService,
}));

const createCaller = createCallerFactory(followsRouter);
const database = {} as Database;

const [userFollower, userFollowedOne, userFollowedTwo] = [
  fakeUserPublic(),
  fakeUserPublic(),
  fakeUserPublic(),
];

beforeEach(() => mockGetFollowing.mockReset());

describe('Unauthenticated tests', () => {
  const { getFollowing } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(getFollowing()).rejects.toThrow(/unauthenticated/i);
  });
});

describe('Authenticated tests', () => {
  const { getFollowing } = createCaller(
    authContext({ database }, userFollower)
  );

  describe('Checking currently logged in user', () => {
    it('Should return an empty array if user is not following anyone', async () => {
      mockGetFollowing.mockResolvedValueOnce([]);

      await expect(getFollowing()).resolves.toEqual([]);
    });

    it('Should return an array of 2 users if user is following 2 other users', async () => {
      const followedUsers = [userFollowedOne, userFollowedTwo];

      mockGetFollowing.mockResolvedValueOnce(followedUsers);

      await expect(getFollowing()).resolves.toEqual(followedUsers);
    });
  });

  describe('Checking other user (not by cookies)', () => {
    it('Should return an empty array if user is not following anyone', async () => {
      mockGetFollowing.mockResolvedValueOnce([]);

      await expect(getFollowing({ userId: userFollower.id })).resolves.toEqual(
        []
      );
    });

    it('Should return an array of 2 users if user is following 2 other users', async () => {
      const followedUsers = [userFollowedOne, userFollowedTwo];

      mockGetFollowing.mockResolvedValueOnce(followedUsers);

      await expect(getFollowing({ userId: userFollower.id })).resolves.toEqual(
        followedUsers
      );
    });
  });
});
