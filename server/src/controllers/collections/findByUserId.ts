import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { oauthUserIdSchema } from '@server/entities/shared';
import * as z from 'zod';
import { collectionsPublicBasicSchemaArray } from '@server/controllers/outputSchemas/collectionsSchemas';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/collections/findByUserId',
      summary: 'Get all collections by the user',
      tags: ['Collections'],
      protect: true,
    },
  })
  .input(z.object({ userId: oauthUserIdSchema.nullish() }).nullish())
  .output(collectionsPublicBasicSchemaArray)
  .query(async ({ input, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const userId = input?.userId ?? authUser.id;

      return services.collectionsService.findByUserId(userId);
    })
  );
