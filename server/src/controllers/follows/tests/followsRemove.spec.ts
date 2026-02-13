import { createCallerFactory } from '@server/trpc';
import { authContext, requestContext } from '@tests/utils/context';
import { fakeFollow, fakeUser } from '@server/entities/tests/fakes';
import type { FollowsService } from '@server/services/followsService';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import FollowLinkNotFound from '@server/utils/errors/follows/FollowLinkNotFound';
import type { Database } from '@server/database';
import followsRouter from '..';

const mockRemove = vi.fn();

const mockFollowsService: Partial<FollowsService> = {
  remove: mockRemove,
};

vi.mock('@server/services/followsService', () => ({
  followsService: () => mockFollowsService,
}));

const createCaller = createCallerFactory(followsRouter);
const database = {} as Database;

const [userFollower, userFollowed] = [fakeUser(), fakeUser()];

const createdFollowLink = fakeFollow({
  followerId: userFollower.id,
  followedId: userFollowed.id,
});

beforeEach(() => mockRemove.mockReset());

describe('Unauthenticated tests', () => {
  const { unfollow } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(unfollow({ userId: userFollowed.id })).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { unfollow } = createCaller(authContext({ database }));

  afterEach(() => expect(mockRemove).toHaveBeenCalledOnce());

  it('Should throw an error when user is not found', async () => {
    mockRemove.mockRejectedValueOnce(new UserNotFound());

    await expect(unfollow({ userId: userFollowed.id })).rejects.toThrow(
      /not found/i
    );
  });

  it('Should throw an error when the follow link was not found', async () => {
    mockRemove.mockRejectedValueOnce(new FollowLinkNotFound());

    await expect(unfollow({ userId: userFollowed.id })).rejects.toThrow(
      /not found/i
    );
  });

  it('Should throw a general error for any other error', async () => {
    mockRemove.mockRejectedValueOnce(new Error('Other Error'));

    await expect(unfollow({ userId: userFollowed.id })).rejects.toThrow(
      /unexpected/i
    );
  });

  it('Should remove the follow and return undefined', async () => {
    mockRemove.mockResolvedValueOnce(createdFollowLink);

    await expect(
      unfollow({ userId: createdFollowLink.followedId })
    ).resolves.toBeUndefined();
  });
});
