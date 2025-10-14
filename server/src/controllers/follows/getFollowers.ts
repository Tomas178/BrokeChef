import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdSchema } from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .input(oauthUserIdSchema.nullish())
  .query(async ({ input: userId, ctx: { services, authUser } }) => {
    userId = userId ?? authUser.id;

    const followers = await services.followsService.getFollowers(userId);

    return followers;
  });
