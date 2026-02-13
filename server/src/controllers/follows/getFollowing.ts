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
      path: '/follows/getFollowing',
      summary: 'Get all the users that user is following',
      tags: ['Follows'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectNullishSchema)
  .output(usersPublicArrayOutputSchema)
  .query(async ({ input, ctx: { services, authUser } }) => {
    const followerId = input?.userId ?? authUser.id;

    const usersFollowing =
      await services.followsService.getFollowing(followerId);

    return usersFollowing;
  });
