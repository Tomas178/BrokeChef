import { oauthUserIdSchema } from '@server/entities/shared';
import { followsService } from '@server/services/followsService';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .input(oauthUserIdSchema.nullish())
  .query(async ({ input: followerId, ctx: { services, authUser } }) => {
    followerId = followerId ?? authUser.id;

    const totalFollowing =
      await services.followsService.totalFollowing(followerId);

    return totalFollowing;
  });
