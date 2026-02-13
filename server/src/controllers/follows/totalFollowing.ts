import {
  nonNegativeIntegerSchema,
  oauthUserIdObjectNullishSchema,
} from '@server/entities/shared';
import { followsService } from '@server/services/followsService';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/follows/totalFollowing',
      summary: 'Get the total count of total users that the user is following',
      tags: ['Follows'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectNullishSchema)
  .output(nonNegativeIntegerSchema)
  .query(async ({ input, ctx: { services, authUser } }) => {
    const followerId = input?.userId ?? authUser.id;

    const totalFollowing =
      await services.followsService.totalFollowing(followerId);

    return totalFollowing;
  });
