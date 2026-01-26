import { collectionAuthorProcedure } from '@server/trpc/collectionAuthorProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import { TRPCError } from '@trpc/server';
import { S3ServiceException } from '@aws-sdk/client-s3';

export default collectionAuthorProcedure
  .use(provideServices({ collectionsService }))
  .mutation(async ({ input: collectionId, ctx: { services } }) => {
    try {
      await services.collectionsService.remove(collectionId);

      return;
    } catch (error) {
      if (error instanceof CollectionNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error instanceof S3ServiceException) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete the recipe',
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        cause: error,
      });
    }
  });
