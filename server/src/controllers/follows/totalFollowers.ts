import { followsService } from '@server/services/followsService';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .query(async ({ ctx: { services, authUser } }) => {
    const totalFollowers = await services.followsService.totalFollowers(
      authUser.id
    );

    return totalFollowers;
  });
