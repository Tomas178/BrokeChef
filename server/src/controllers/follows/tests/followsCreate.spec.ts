import { createCallerFactory } from '@server/trpc';
import { fakeFollow, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import UserAlreadyFollowed from '@server/utils/errors/follows/UserAlreadyFollowed';
import type { FollowsService } from '@server/services/followsService';
import type { Database } from '@server/database';
import followsRouter from '..';

const mockCreate = vi.fn();

const mockFollowsService: Partial<FollowsService> = {
  create: mockCreate,
};

vi.mock('@server/services/followsService', () => ({
  followsService: () => mockFollowsService,
}));

const createCaller = createCallerFactory(followsRouter);
const database = {} as Database;

const [userFollower, userFollowed] = [fakeUser(), fakeUser()];

const createdLink: Awaited<ReturnType<FollowsService['create']>> = fakeFollow({
  followerId: userFollower.id,
  followedId: userFollowed.id,
});

beforeEach(() => mockCreate.mockReset());

describe('Unauthenticated tests', () => {
  const { follow } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(follow({ userId: userFollowed.id })).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { follow } = createCaller(authContext({ database }, userFollower));

  afterEach(() => expect(mockCreate).toHaveBeenCalledOnce());

  it('Should throw an error when user is not found', async () => {
    mockCreate.mockRejectedValueOnce(new UserNotFound());

    await expect(follow({ userId: userFollowed.id })).rejects.toThrow(
      /not found/i
    );
  });

  it('Should throw an error if user is already followed', async () => {
    mockCreate.mockRejectedValueOnce(new UserAlreadyFollowed());

    await expect(follow({ userId: userFollowed.id })).rejects.toThrow(
      /exists|already|follow(ed|ing)/i
    );
  });

  it('Should throw a general error for any other error', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Other Error'));

    await expect(follow({ userId: userFollowed.id })).rejects.toThrow(
      /unexpected/i
    );
  });

  it('Should create the follow', async () => {
    mockCreate.mockResolvedValueOnce(createdLink);

    await expect(follow({ userId: createdLink.followedId })).resolves.toEqual(
      createdLink
    );
  });
});
