import type { FollowsService } from '@server/services/followsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeUserPublic } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import followsRouter from '..';

const mockGetFollowers = vi.fn();

const mockFollowsService: Partial<FollowsService> = {
  getFollowers: mockGetFollowers,
};

vi.mock('@server/services/followsService', () => ({
  followsService: () => mockFollowsService,
}));

const createCaller = createCallerFactory(followsRouter);
const database = {} as Database;

const [userFollowerOne, userFollowerTwo, userFollowed] = [
  fakeUserPublic(),
  fakeUserPublic(),
  fakeUserPublic(),
];

beforeEach(() => mockGetFollowers.mockReset());

describe('Unauthenticated tests', () => {
  const { getFollowers } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(getFollowers()).rejects.toThrow(/unauthenticated/i);
  });
});

describe('Authenticated tests', () => {
  const { getFollowers } = createCaller(
    authContext({ database }, userFollowed)
  );

  describe('Checking currently logged in user', () => {
    it('Should return an empty array if user has no followers', async () => {
      mockGetFollowers.mockResolvedValueOnce([]);

      await expect(getFollowers()).resolves.toEqual([]);
    });

    it('Should return an array of 2 users if user has 2 followers', async () => {
      const followingUsers = [userFollowerOne, userFollowerTwo];

      mockGetFollowers.mockResolvedValueOnce(followingUsers);

      await expect(getFollowers()).resolves.toEqual(followingUsers);
    });
  });

  describe('Checking other user (not by cookies)', () => {
    it('Should return an empty array if user has no followers', async () => {
      mockGetFollowers.mockResolvedValueOnce([]);

      await expect(getFollowers({ userId: userFollowed.id })).resolves.toEqual(
        []
      );
    });

    it('Should return an array of 2 users if user has 2 followers', async () => {
      const followingUsers = [userFollowerOne, userFollowerTwo];

      mockGetFollowers.mockResolvedValueOnce(followingUsers);

      await expect(getFollowers({ userId: userFollowed.id })).resolves.toEqual(
        followingUsers
      );
    });
  });
});
