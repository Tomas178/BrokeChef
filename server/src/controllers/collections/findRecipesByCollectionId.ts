import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { integerIdObjectSchema } from '@server/entities/shared';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import { TRPCError } from '@trpc/server';
import { recipesPublicArrayOutputSchema } from '../outputSchemas/recipesSchemas';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/collections/findRecipesByCollectionId',
      summary: 'Find all recipes in the collection',
      tags: ['Collections'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(recipesPublicArrayOutputSchema)
  .query(async ({ input: { id: collectionId }, ctx: { services } }) => {
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

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        cause: error,
      });
    }
  });
