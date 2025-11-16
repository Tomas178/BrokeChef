import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { integerIdSchema } from '@server/entities/shared';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import { TRPCError } from '@trpc/server';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .input(integerIdSchema)
  .query(async ({ input: collectionId, ctx: { services } }) => {
    try {
      const recipesInCollection =
        await services.collectionsService.findRecipesByCollectionId(
          collectionId
        );

      return recipesInCollection;
    } catch (error) {
      if (error instanceof CollectionNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      throw error;
    }
  });
