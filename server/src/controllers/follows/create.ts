import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdSchema } from '@server/entities/shared';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import UserAlreadyFollowed from '@server/utils/errors/follows/UserAlreadyFollowed';
import type { FollowLink } from '@server/repositories/followsRepository';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .input(oauthUserIdSchema)
  .mutation(async ({ input: followedId, ctx: { services, authUser } }) => {
    try {
      const followLink: FollowLink = { followerId: authUser.id, followedId };

      const createdFollowLink =
        await services.followsService.create(followLink);

      return createdFollowLink;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error instanceof UserAlreadyFollowed) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: error.message,
        });
      }

      throw new Error('Failed to follow the user');
    }
  });
