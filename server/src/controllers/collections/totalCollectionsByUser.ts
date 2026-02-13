import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import {
  nonNegativeIntegerSchema,
  oauthUserIdObjectNullishSchema,
} from '@server/entities/shared';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/collections/totalCount',
      summary: 'Get total count of collections for user',
      tags: ['Collections'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectNullishSchema)
  .output(nonNegativeIntegerSchema)
  .query(async ({ input, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const userId = input?.userId ?? authUser.id;

      const totalCount =
        await services.collectionsService.totalCollectionsByUser(userId);

      return totalCount;
    })
  );
