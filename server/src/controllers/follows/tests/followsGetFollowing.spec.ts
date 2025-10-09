import type { FollowsService } from '@server/services/followsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeUser } from '@server/entities/tests/fakes';
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

const [userFollowerOne, userFollowerTwo, userFollowed] = [
  fakeUser(),
  fakeUser(),
  fakeUser(),
];

beforeEach(() => mockGetFollowing.mockReset());

describe('Unauthenticated tests', () => {
  const { getFollowing } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(getFollowing(userFollowerOne.id)).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { getFollowing } = createCaller(
    authContext({ database }, userFollowed)
  );

  it('Should return an empty array if user is not following anyone', async () => {
    mockGetFollowing.mockResolvedValueOnce([]);

    await expect(getFollowing(userFollowerOne.id)).resolves.toEqual([]);
  });

  it('Should return an array of 2 users if user is following 2 other users', async () => {
    const followingUsers = [userFollowerOne, userFollowerTwo];

    mockGetFollowing.mockResolvedValueOnce(followingUsers);

    await expect(getFollowing(userFollowerOne.id)).resolves.toEqual(
      followingUsers
    );
  });
});
