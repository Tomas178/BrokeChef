import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdObjectNullishSchema } from '@server/entities/shared';
import { usersPublicArrayOutputSchema } from '../outputSchemas/usersSchemas';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/follows/getFollowers',
      summary: 'Get all the followers that the user has',
      tags: ['Follows'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectNullishSchema)
  .output(usersPublicArrayOutputSchema)
  .query(async ({ input, ctx: { services, authUser } }) => {
    const userId = input?.userId ?? authUser.id;

    const followers = await services.followsService.getFollowers(userId);

    return followers;
  });
