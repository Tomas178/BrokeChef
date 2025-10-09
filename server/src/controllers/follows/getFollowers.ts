import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .query(async ({ ctx: { services, authUser } }) => {
    const followers = await services.followsService.getFollowers(authUser.id);

    return followers;
  });
