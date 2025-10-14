import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdSchema } from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .input(oauthUserIdSchema.nullish())
  .query(async ({ input: followerId, ctx: { services, authUser } }) => {
    followerId = followerId ?? authUser.id;

    const usersFollowing =
      await services.followsService.getFollowing(followerId);

    return usersFollowing;
  });
