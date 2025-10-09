import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdSchema } from '@server/entities/shared';
import type { FollowLink } from '@server/repositories/followsRepository';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import FollowLinkNotFound from '@server/utils/errors/follows/FollowLinkNotFound';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .input(oauthUserIdSchema)
  .mutation(async ({ input: followedId, ctx: { services, authUser } }) => {
    try {
      const unfollowLink: FollowLink = {
        followerId: authUser.id,
        followedId,
      };

      await services.followsService.remove(unfollowLink);

      return;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error instanceof FollowLinkNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      throw new Error('Failed to unfollow the user');
    }
  });
