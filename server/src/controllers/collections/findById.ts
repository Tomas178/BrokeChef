import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { integerIdObjectSchema } from '@server/entities/shared';
import { collectionsSchema } from '@server/entities/collections';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/collections/findById/{id}',
      summary: 'Find collection by ID',
      tags: ['Collections'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(collectionsSchema.optional())
  .query(async ({ input: { id: collectionId }, ctx: { services } }) =>
    withServiceErrors(async () => {
      const collection =
        await services.collectionsService.findById(collectionId);

      return collection;
    })
  );
