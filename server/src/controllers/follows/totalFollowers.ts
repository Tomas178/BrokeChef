import { oauthUserIdSchema } from '@server/entities/shared';
import { followsService } from '@server/services/followsService';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .input(oauthUserIdSchema.optional())
  .query(async ({ input: userId, ctx: { services, authUser } }) => {
    userId = userId ?? authUser.id;

    const totalFollowers = await services.followsService.totalFollowers(userId);

    return totalFollowers;
  });
