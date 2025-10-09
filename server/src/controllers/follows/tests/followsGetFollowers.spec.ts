import type { FollowsService } from '@server/services/followsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeUser } from '@server/entities/tests/fakes';
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

const [userFollower, userFollowedOne, userFollowedTwo] = [
  fakeUser(),
  fakeUser(),
  fakeUser(),
];

beforeEach(() => mockGetFollowers.mockReset());

describe('Unauthenticated tests', () => {
  const { getFollowers } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(getFollowers(userFollower.id)).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { getFollowers } = createCaller(
    authContext({ database }, userFollower)
  );

  it('Should return an empty array if user has no followers', async () => {
    mockGetFollowers.mockResolvedValueOnce([]);

    await expect(getFollowers(userFollower.id)).resolves.toEqual([]);
  });

  it('Should return an array of 2 users if has 2 followers', async () => {
    const followedUsers = [userFollowedOne, userFollowedTwo];

    mockGetFollowers.mockResolvedValueOnce(followedUsers);

    await expect(getFollowers(userFollower.id)).resolves.toEqual(followedUsers);
  });
});
