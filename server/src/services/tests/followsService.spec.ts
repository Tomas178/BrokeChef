import type { Database } from '@server/database';
import { fakeFollow, fakeUser } from '@server/entities/tests/fakes';
import type {
  FollowLink,
  FollowsRepository,
} from '@server/repositories/followsRepository';
import type { UsersRepository } from '@server/repositories/usersRepository';
import type { Mock } from 'vitest';
import { followsService as buildFollowsService } from '@server/services/followsService';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { PostgresError } from 'pg-error-enum';
import { NoResultError } from 'kysely';

vi.mock('@server/utils/errors', () => ({
  assertPostgresError: vi.fn(),
  assertError: vi.fn(),
}));

const fakeImageUrl = vi.hoisted(() => 'fake-url');

const mockSignImages = vi.hoisted(() =>
  vi.fn((images: string | string[]) => {
    if (Array.isArray(images)) {
      return images.map(() => fakeImageUrl);
    }
    return fakeImageUrl;
  })
);

vi.mock('@server/utils/signImages', () => ({
  signImages: mockSignImages,
}));

const mockValidateUserExists = vi.hoisted(() => vi.fn());
const [totalFollowingCount, totalFollowersCount] = vi.hoisted(() => [5, 10]);

vi.mock('@server/services/utils/userValidations', () => ({
  validateUserExists: mockValidateUserExists,
}));

const users = {
  followerOne: fakeUser(),
  followerTwo: fakeUser(),
  followedOne: fakeUser(),
  followedTwo: fakeUser(),
  withoutImage: fakeUser({ image: null }),
};

const mockFollowsRepoCreate: Mock<FollowsRepository['create']> = vi.fn(
  async ({ followerId, followedId }) => fakeFollow({ followerId, followedId })
);

const mockFollowsRepoRemove: Mock<FollowsRepository['remove']> = vi.fn(
  async ({ followerId, followedId }) => fakeFollow({ followerId, followedId })
);

const mockFollowsRepoIsFollowing: Mock<FollowsRepository['isFollowing']> =
  vi.fn();

const mockFollowsRepoTotalFollowing: Mock<FollowsRepository['totalFollowing']> =
  vi.fn(async _followerId => totalFollowingCount);

const mockFollowsRepoTotalFollowers: Mock<FollowsRepository['totalFollowers']> =
  vi.fn(async _userId => totalFollowersCount);

const mockFollowsRepoGetFollowing: Mock<FollowsRepository['getFollowing']> =
  vi.fn(async _followerId => [users.followedOne, users.followedTwo]);

const mockFollowsRepoGetFollowers: Mock<FollowsRepository['getFollowers']> =
  vi.fn(async _userId => [users.followerOne, users.followerTwo]);

const mockFollowsRepository = {
  create: mockFollowsRepoCreate,
  remove: mockFollowsRepoRemove,
  isFollowing: mockFollowsRepoIsFollowing,
  totalFollowing: mockFollowsRepoTotalFollowing,
  totalFollowers: mockFollowsRepoTotalFollowers,
  getFollowing: mockFollowsRepoGetFollowing,
  getFollowers: mockFollowsRepoGetFollowers,
} as FollowsRepository;

const mockUsersRepoFindById: Mock<UsersRepository['findById']> = vi.fn(
  async id => fakeUser({ id })
);

const mockUsersRepository = {
  findById: mockUsersRepoFindById,
} as Partial<UsersRepository>;

vi.mock('@server/repositories/followsRepository', () => ({
  followsRepository: () => mockFollowsRepository,
}));

vi.mock('@server/repositories/usersRepository', () => ({
  usersRepository: () => mockUsersRepository,
}));

const mockDatabase = {} as Database;

const followsService = buildFollowsService(mockDatabase);

const [userFollower, userFollowed] = [fakeUser(), fakeUser()];

const [followerId, followedId] = [userFollower, userFollowed].map(
  user => user.id
);

const followLink: FollowLink = {
  followerId,
  followedId,
};

const generalErroMessage = 'Something else happened';

beforeEach(() => vi.resetAllMocks());

describe('create', () => {
  it('Should throw an error if user that is being followed is not found', async () => {
    mockValidateUserExists.mockRejectedValueOnce(new UserNotFound());

    await expect(followsService.create(followLink)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should throw a general error if any other error occurs', async () => {
    mockValidateUserExists.mockRejectedValueOnce(new Error(generalErroMessage));

    await expect(followsService.create(followLink)).rejects.toThrow(
      generalErroMessage
    );
  });

  it('Should throw a Postgres error if a non-unique-violation Postgres error occurs in repository', async () => {
    mockFollowsRepoCreate.mockRejectedValueOnce({
      code: PostgresError.FOREIGN_KEY_VIOLATION,
    });

    await expect(followsService.create(followLink)).rejects.toThrow();
  });

  it('Should throw an error if follow link is already present in the database', async () => {
    mockFollowsRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(followsService.create(followLink)).rejects.toThrow(
      /exists|created|already|followed/i
    );
  });

  it('Should create the new follow link', async () => {
    const newFollowLink = await followsService.create(followLink);

    expect(newFollowLink).toEqual({
      ...followLink,
      createdAt: expect.any(Date),
    });
  });
});

describe('remove', () => {
  it('Should throw an error if user that is being unfollowed is not found', async () => {
    mockValidateUserExists.mockRejectedValueOnce(new UserNotFound());

    await expect(followsService.create(followLink)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should throw an error if no result has been returned from database', async () => {
    mockFollowsRepoRemove.mockRejectedValueOnce(new NoResultError({} as any));

    await expect(followsService.remove(followLink)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should throw a general error if any other error occurs', async () => {
    mockFollowsRepoRemove.mockRejectedValueOnce(new Error(generalErroMessage));

    await expect(followsService.remove(followLink)).rejects.toThrow(
      generalErroMessage
    );
  });

  it('Should remove the follow link', async () => {
    const removedFollowLink = await followsService.remove(followLink);

    expect(removedFollowLink).toEqual({
      ...followLink,
      createdAt: expect.any(Date),
    });
  });
});

describe('isFollowing', () => {
  it('Should return false it the user is not following the given user', async () => {
    mockFollowsRepoIsFollowing.mockResolvedValueOnce(false);

    await expect(followsService.isFollowing(followLink)).resolves.toBeFalsy();
  });

  it('Should return true it the user is following the given user', async () => {
    mockFollowsRepoIsFollowing.mockResolvedValueOnce(true);

    await expect(followsService.isFollowing(followLink)).resolves.toBeTruthy();
  });
});

describe('totalFollowing', () => {
  it('Should return 0 if user is not following anyone', async () => {
    const zero = 0;

    mockFollowsRepoTotalFollowing.mockResolvedValueOnce(zero);

    await expect(followsService.totalFollowing(followerId)).resolves.toBe(zero);
  });

  it('Should return correct following count if the user is following some users', async () => {
    await expect(followsService.totalFollowing(followerId)).resolves.toBe(
      totalFollowingCount
    );
  });
});

describe('totalFollowers', () => {
  it('Should return 0 if user is not being followed by anyone', async () => {
    const zero = 0;

    mockFollowsRepoTotalFollowers.mockResolvedValueOnce(zero);

    await expect(followsService.totalFollowers(followedId)).resolves.toBe(zero);
  });

  it('Should return correct followers count if the user is being followed by some users', async () => {
    await expect(followsService.totalFollowers(followedId)).resolves.toBe(
      totalFollowersCount
    );
  });
});

describe('getFollowing', () => {
  it('Should return an empty array if user is not following anyone', async () => {
    mockFollowsRepoGetFollowing.mockResolvedValueOnce([]);

    await expect(followsService.getFollowing(followerId)).resolves.toEqual([]);
  });

  it('Should return an array of users of which the user is following', async () => {
    const usersFollowing = await followsService.getFollowing(followerId);

    expect(usersFollowing[0]).toEqual({
      ...users.followedOne,
      image: fakeImageUrl,
    });
    expect(usersFollowing[1]).toEqual({
      ...users.followedTwo,
      image: fakeImageUrl,
    });
  });

  it('Should return null for users with no image', async () => {
    mockFollowsRepoGetFollowing.mockResolvedValueOnce([
      users.withoutImage,
      users.followedOne,
    ]);

    const usersFollowing = await followsService.getFollowing(followerId);

    expect(mockSignImages).toHaveBeenCalledWith([users.followedOne.image]);

    expect(usersFollowing[0].image).toBeNull();
    expect(usersFollowing[1].image).toBe(fakeImageUrl);
  });

  it('Should return null for users that had image url but signedImages for some reason are missing signed url', async () => {
    mockFollowsRepoGetFollowing.mockResolvedValueOnce([
      users.withoutImage,
      users.followedOne,
    ]);
    mockSignImages.mockResolvedValueOnce([]);

    const usersFollowing = await followsService.getFollowing(followerId);

    expect(mockSignImages).toHaveBeenCalledWith([users.followedOne.image]);

    expect(usersFollowing[0].image).toBeNull();
    expect(usersFollowing[1].image).toBeNull();
  });
});

describe('getFollowers', () => {
  it('Should return an empty array if user has no followers anyone', async () => {
    mockFollowsRepoGetFollowers.mockResolvedValueOnce([]);

    await expect(followsService.getFollowers(followedId)).resolves.toEqual([]);
  });

  it('Should return an array of users followers by the given userId', async () => {
    const followers = await followsService.getFollowers(followedId);

    expect(followers[0]).toEqual({ ...users.followerOne, image: fakeImageUrl });
    expect(followers[1]).toEqual({ ...users.followerTwo, image: fakeImageUrl });
  });

  it('Should return null for users with no image', async () => {
    mockFollowsRepoGetFollowers.mockResolvedValueOnce([
      users.withoutImage,
      users.followerOne,
    ]);

    const followers = await followsService.getFollowers(followerId);

    expect(mockSignImages).toHaveBeenCalledWith([users.followerOne.image]);

    expect(followers[0].image).toBeNull();
    expect(followers[1].image).toBe(fakeImageUrl);
  });

  it('Should return null for users that had image url but signedImages for some reason are missing signed url', async () => {
    mockFollowsRepoGetFollowers.mockResolvedValueOnce([
      users.withoutImage,
      users.followerOne,
    ]);
    mockSignImages.mockResolvedValueOnce([]);

    const followers = await followsService.getFollowers(followerId);

    expect(mockSignImages).toHaveBeenCalledWith([users.followerOne.image]);

    expect(followers[0].image).toBeNull();
    expect(followers[1].image).toBeNull();
  });
});
