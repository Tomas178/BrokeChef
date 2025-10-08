import type { Database, Follows } from '@server/database';
import {
  followsKeysPublic,
  type FollowsPublic,
} from '@server/entities/follows';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';
import type { Insertable } from 'kysely';

const TABLE = 'follows';

export type FollowLink = Insertable<Follows>;

export interface FollowsRepository {
  create: (followLink: FollowLink) => Promise<FollowsPublic>;
  remove: (followLink: FollowLink) => Promise<FollowsPublic>;
  isFollowing: (followLink: FollowLink) => Promise<boolean>;
  totalFollowing: (followerId: string) => Promise<number>;
  totalFollowers: (userId: string) => Promise<number>;
  getFollowing: (followerId: string) => Promise<UsersPublic[]>;
  getFollowers: (userId: string) => Promise<UsersPublic[]>;
}

export function followsRepository(database: Database): FollowsRepository {
  return {
    async create(followLink) {
      return database
        .insertInto(TABLE)
        .values(followLink)
        .returning(followsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(followLink) {
      return database
        .deleteFrom(TABLE)
        .where('followerId', '=', followLink.followerId)
        .where('followedId', '=', followLink.followedId)
        .returning(followsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async isFollowing(followLink) {
      const exists = await database
        .selectFrom(TABLE)
        .select('followerId')
        .where('followerId', '=', followLink.followerId)
        .where('followedId', '=', followLink.followedId)
        .executeTakeFirst();

      return !!exists;
    },

    async totalFollowing(followerId) {
      const { totalFollowing } = await database
        .selectFrom(TABLE)
        .select(({ fn }) => fn.count('followerId').as('totalFollowing'))
        .where('followerId', '=', followerId)
        .groupBy('followerId')
        .executeTakeFirstOrThrow();

      return Number(totalFollowing);
    },

    async totalFollowers(userId) {
      const { totalFollowers } = await database
        .selectFrom(TABLE)
        .select(({ fn }) => fn.count('followedId').as('totalFollowers'))
        .where('followedId', '=', userId)
        .groupBy('followedId')
        .executeTakeFirstOrThrow();

      return Number(totalFollowers);
    },

    async getFollowing(followerId) {
      return database
        .selectFrom(TABLE)
        .innerJoin('users', 'users.id', 'follows.followedId')
        .select(usersKeysPublic)
        .where('follows.followerId', '=', followerId)
        .execute();
    },

    async getFollowers(userId) {
      return database
        .selectFrom(TABLE)
        .innerJoin('users', 'users.id', 'follows.followerId')
        .select(usersKeysPublic)
        .where('follows.followedId', '=', userId)
        .execute();
    },
  };
}
