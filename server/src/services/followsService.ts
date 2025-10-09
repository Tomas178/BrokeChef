import type { Database } from '@server/database';
import type { FollowsPublic } from '@server/entities/follows';
import type { UsersPublic } from '@server/entities/users';
import type { FollowLink } from '@server/repositories/followsRepository';
import { followsRepository as buildFollowsRepository } from '@server/repositories/followsRepository';
import { usersRepository as buildUsersRepository } from '@server/repositories/usersRepository';
import { assertError, assertPostgresError } from '@server/utils/errors';
import { PostgresError } from 'pg-error-enum';
import UserAlreadyFollowed from '@server/utils/errors/follows/UserAlreadyFollowed';
import { NoResultError } from 'kysely';
import FollowLinkNotFound from '@server/utils/errors/follows/FollowLinkNotFound';
import { validateUserExists } from './utils/userValidations';

interface FollowsService {
  create: (followLink: FollowLink) => Promise<FollowsPublic>;
  remove: (followLink: FollowLink) => Promise<FollowsPublic>;
  isFollowing: (followLink: FollowLink) => Promise<boolean>;
  totalFollowing: (followerId: string) => Promise<number>;
  totalFollowers: (userId: string) => Promise<number>;
  getFollowing: (followerId: string) => Promise<UsersPublic[]>;
  getFollowers: (userId: string) => Promise<UsersPublic[]>;
}

export function followsService(database: Database): FollowsService {
  const followsRepository = buildFollowsRepository(database);
  const usersRepository = buildUsersRepository(database);

  return {
    async create(followLink) {
      await validateUserExists(usersRepository, followLink.followedId);

      try {
        const createdLink = await followsRepository.create(followLink);

        return createdLink;
      } catch (error) {
        assertPostgresError(error);

        if (error.code === PostgresError.UNIQUE_VIOLATION) {
          throw new UserAlreadyFollowed();
        }
        throw error;
      }
    },

    async remove(followLink) {
      await validateUserExists(usersRepository, followLink.followedId);

      try {
        const unfollowedLink = await followsRepository.remove(followLink);

        return unfollowedLink;
      } catch (error) {
        assertError(error);

        if (error instanceof NoResultError) throw new FollowLinkNotFound();

        throw error;
      }
    },

    async isFollowing(followLink) {
      const isFollowing = await followsRepository.isFollowing(followLink);

      return isFollowing;
    },

    async totalFollowing(followerId) {
      const totalFollowing = await followsRepository.totalFollowing(followerId);

      return totalFollowing;
    },

    async totalFollowers(userId) {
      const totalFollowers = await followsRepository.totalFollowers(userId);

      return totalFollowers;
    },

    async getFollowing(followerId) {
      const followingUsers = await followsRepository.getFollowing(followerId);

      return followingUsers;
    },

    async getFollowers(userId) {
      const followers = await followsRepository.getFollowers(userId);

      return followers;
    },
  };
}
