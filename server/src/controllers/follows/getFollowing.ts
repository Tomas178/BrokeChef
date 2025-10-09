import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .query(async ({ ctx: { services, authUser } }) => {
    const usersFollowing = await services.followsService.getFollowing(
      authUser.id
    );

    return usersFollowing;
  });
