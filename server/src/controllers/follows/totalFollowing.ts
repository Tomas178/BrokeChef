import { followsService } from '@server/services/followsService';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .query(async ({ ctx: { services, authUser } }) => {
    const totalFollowing = await services.followsService.totalFollowing(
      authUser.id
    );

    return totalFollowing;
  });
