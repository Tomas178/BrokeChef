import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import {
  collectionsSchema,
  createCollectionRequestSchema,
  type CreateCollectionInput,
} from '@server/entities/collections';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/collections/create',
      summary: 'Create a collection',
      tags: ['Collections'],
      protect: true,
    },
  })
  .input(createCollectionRequestSchema)
  .output(collectionsSchema.optional())
  .mutation(async ({ input: request, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const collectionInput: CreateCollectionInput = {
        ...request,
        userId: authUser.id,
      };

      return services.collectionsService.create(collectionInput);
    })
  );
