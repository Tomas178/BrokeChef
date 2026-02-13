import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import {
  booleanSchema,
  oauthUserIdObjectSchema,
} from '@server/entities/shared';
import type { FollowLink } from '@server/repositories/followsRepository';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/follows/isFollowing',
      summary: 'Check if the user is following the given user',
      tags: ['Follows'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectSchema)
  .output(booleanSchema)
  .query(
    async ({ input: { userId: followedId }, ctx: { services, authUser } }) => {
      const followLink: FollowLink = { followerId: authUser.id, followedId };

      const isFollowing = await services.followsService.isFollowing(followLink);

      return isFollowing;
    }
  );
