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
      path: '/follows/totalFollowers',
      summary: 'Get the total count of total followers that the user has',
      tags: ['Follows'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectNullishSchema)
  .output(nonNegativeIntegerSchema)
  .query(async ({ input, ctx: { services, authUser } }) => {
    const userId = input?.userId ?? authUser.id;

    const totalFollowers = await services.followsService.totalFollowers(userId);

    return totalFollowers;
  });
