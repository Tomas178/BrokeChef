import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/record';
import { fakeFollow, fakeUser } from '@server/entities/tests/fakes';
import { NoResultError } from 'kysely';
import { pick } from 'lodash-es';
import { usersKeysPublic } from '@server/entities/users';
import { followsRepository } from '../followsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = followsRepository(database);

const [userFollower, userFollowed] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const followLink = {
  followerId: userFollower.id,
  followedId: userFollowed.id,
};

const nonExistantUserId = userFollower.id + userFollowed.id;

describe('create', () => {
  it('Should throw an error if follower does not exist', async () => {
    await expect(
      repository.create({ ...followLink, followerId: nonExistantUserId })
    ).rejects.toThrow();
  });

  it('Should throw an error if user to be followed does not exist', async () => {
    await expect(
      repository.create({ ...followLink, followedId: nonExistantUserId })
    ).rejects.toThrow();
  });

  it('Should create new follow link', async () => {
    const newFollowLink = await repository.create(followLink);

    expect(newFollowLink).toMatchObject({
      ...followLink,
      createdAt: expect.any(Date),
    });
  });
});

describe('remove', () => {
  it('Should throw an error if follow record does not exist', async () => {
    await expect(repository.remove(followLink)).rejects.toThrowError(
      NoResultError
    );
  });

  it('Should remove the follow record', async () => {
    await insertAll(database, 'follows', fakeFollow(followLink));

    const removedFollowLink = await repository.remove(followLink);

    expect(removedFollowLink).toMatchObject({
      ...followLink,
      createdAt: expect.any(Date),
    });
  });
});

describe('isFollowing', () => {
  it('Should return false', async () => {
    await expect(repository.isFollowing(followLink)).resolves.toBeFalsy();
  });

  it('Should return true', async () => {
    await insertAll(database, 'follows', fakeFollow(followLink));

    await expect(repository.isFollowing(followLink)).resolves.toBeTruthy();
  });
});

describe('totalFollowing', () => {
  it('Should return 0 if user is not following anyone', async () => {
    await expect(
      repository.totalFollowing(followLink.followerId)
    ).resolves.toBe(0);
  });

  it('Should return total following count by the given follower ID', async () => {
    const [userFollowedTwo] = await insertAll(database, 'users', fakeUser());

    const followLinks = await insertAll(database, 'follows', [
      fakeFollow(followLink),
      fakeFollow({
        followerId: followLink.followerId,
        followedId: userFollowedTwo.id,
      }),
    ]);

    await expect(
      repository.totalFollowing(followLink.followerId)
    ).resolves.toBe(followLinks.length);
  });
});

describe('totalFollowed', () => {
  it('Should return 0 if user is not being followed by anyone', async () => {
    await expect(
      repository.totalFollowers(followLink.followedId)
    ).resolves.toBe(0);
  });

  it('Should return total followers count by the given followed ID', async () => {
    const [userFollowerTwo] = await insertAll(database, 'users', fakeUser());

    const followers = await insertAll(database, 'follows', [
      fakeFollow(followLink),
      fakeFollow({
        followerId: userFollowerTwo.id,
        followedId: followLink.followedId,
      }),
    ]);

    await expect(
      repository.totalFollowers(followLink.followedId)
    ).resolves.toBe(followers.length);
  });
});

describe('getFollowing', () => {
  it('Should return an empty array when user if not following anyone', async () => {
    await expect(
      repository.getFollowing(followLink.followerId)
    ).resolves.toEqual([]);
  });

  it('Should return an array of one when the user is following only one user', async () => {
    await insertAll(database, 'follows', fakeFollow(followLink));

    const followsInDatabase = await selectAll(database, 'follows', eb =>
      eb('followerId', '=', followLink.followerId)
    );
    expect(followsInDatabase).toHaveLength(1);
    expect(followsInDatabase[0]).toMatchObject(followLink);

    const followingUsers = await repository.getFollowing(followLink.followerId);

    expect(followingUsers).toHaveLength(1);
    expect(followingUsers[0]).toEqual(pick(userFollowed, usersKeysPublic));
  });

  it('Should return an array of multiple users when the user is following many users', async () => {
    const [userFollowedTwo] = await insertAll(database, 'users', fakeUser());

    const followLinks = await insertAll(database, 'follows', [
      fakeFollow(followLink),
      fakeFollow({
        followerId: followLink.followerId,
        followedId: userFollowedTwo.id,
      }),
    ]);

    const followsInDatabase = await selectAll(database, 'follows', eb =>
      eb('followerId', '=', followLink.followerId)
    );
    expect(followsInDatabase).toHaveLength(followLinks.length);
    expect(followsInDatabase[0]).toMatchObject(followLinks[0]);
    expect(followsInDatabase[1]).toMatchObject(followLinks[1]);

    const followingUsers = await repository.getFollowing(followLink.followerId);

    expect(followingUsers).toHaveLength(followLinks.length);
    expect(followingUsers[0]).toEqual(pick(userFollowed, usersKeysPublic));
    expect(followingUsers[1]).toEqual(pick(userFollowedTwo, usersKeysPublic));
  });
});

describe('getFollowers', () => {
  it('Should return an empty array when user is not followed by anyone', async () => {
    await expect(
      repository.getFollowers(followLink.followedId)
    ).resolves.toEqual([]);
  });

  it('Should return an array of one when the user is followed by only one user', async () => {
    await insertAll(database, 'follows', fakeFollow(followLink));

    const followsInDatabase = await selectAll(database, 'follows', eb =>
      eb('followedId', '=', followLink.followedId)
    );
    expect(followsInDatabase).toHaveLength(1);
    expect(followsInDatabase[0]).toMatchObject(followLink);

    const followingUsers = await repository.getFollowers(followLink.followedId);

    expect(followingUsers).toHaveLength(1);
    expect(followingUsers[0]).toEqual(pick(userFollower, usersKeysPublic));
  });

  it('Should return an array of multiple users when the user is followed by many users', async () => {
    const [userFollowerTwo] = await insertAll(database, 'users', fakeUser());

    const followLinks = await insertAll(database, 'follows', [
      fakeFollow(followLink),
      fakeFollow({
        followerId: userFollowerTwo.id,
        followedId: followLink.followedId,
      }),
    ]);

    const followsInDatabase = await selectAll(database, 'follows', eb =>
      eb('followedId', '=', followLink.followedId)
    );
    expect(followsInDatabase).toHaveLength(followLinks.length);
    expect(followsInDatabase[0]).toMatchObject(followLinks[0]);
    expect(followsInDatabase[1]).toMatchObject(followLinks[1]);

    const usersThatAreFollowing = await repository.getFollowers(
      followLink.followedId
    );

    expect(usersThatAreFollowing).toHaveLength(followLinks.length);
    expect(usersThatAreFollowing[0]).toEqual(
      pick(userFollower, usersKeysPublic)
    );
    expect(usersThatAreFollowing[1]).toEqual(
      pick(userFollowerTwo, usersKeysPublic)
    );
  });
});
