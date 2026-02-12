import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { integerIdObjectSchema } from '@server/entities/shared';
import { collectionsSchema } from '@server/entities/collections';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import { TRPCError } from '@trpc/server';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/collections/findById',
      summary: 'Find collection by ID',
      tags: ['Collections'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(collectionsSchema.optional())
  .query(async ({ input: { id: collectionId }, ctx: { services } }) => {
    try {
      const collection =
        await services.collectionsService.findById(collectionId);

      return collection;
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
