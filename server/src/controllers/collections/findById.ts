import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { integerIdSchema } from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .input(integerIdSchema)
  .query(async ({ input: collectionId, ctx: { services } }) => {
    const collection = await services.collectionsService.findById(collectionId);

    return collection;
  });
