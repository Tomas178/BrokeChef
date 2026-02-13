import { createCallerFactory } from '@server/trpc';
import type { FollowsService } from '@server/services/followsService';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import followsRouter from '..';

const mockIsFollowing = vi.fn();

const mockFollowsService: Partial<FollowsService> = {
  isFollowing: mockIsFollowing,
};

vi.mock('@server/services/followsService', () => ({
  followsService: () => mockFollowsService,
}));

const createCaller = createCallerFactory(followsRouter);
const database = {} as Database;

const [userFollower, userFollowed] = [fakeUser(), fakeUser()];

beforeEach(() => mockIsFollowing.mockReset());

describe('Unauthenticated tests', () => {
  const { isFollowing } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(isFollowing({ userId: userFollowed.id })).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { isFollowing } = createCaller(authContext({ database }, userFollower));

  afterEach(() => expect(mockIsFollowing).toHaveBeenCalledOnce());

  it('Should return false when user is not following the given userId', async () => {
    mockIsFollowing.mockResolvedValueOnce(false);

    await expect(isFollowing({ userId: userFollowed.id })).resolves.toBeFalsy();
  });

  it('Should return true when user is not following the given userId', async () => {
    mockIsFollowing.mockResolvedValueOnce(true);

    await expect(
      isFollowing({ userId: userFollowed.id })
    ).resolves.toBeTruthy();
  });
});
