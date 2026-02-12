import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import {
  collectionsSchema,
  createCollectionRequestSchema,
  type CreateCollectionInput,
} from '@server/entities/collections';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import CollectionAlreadyCreated from '@server/utils/errors/collections/CollectionAlreadyCreated';

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
  .mutation(async ({ input: request, ctx: { authUser, services } }) => {
    try {
      const collectionInput: CreateCollectionInput = {
        ...request,
        userId: authUser.id,
      };

      const createdCollection =
        await services.collectionsService.create(collectionInput);

      return createdCollection;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error instanceof CollectionAlreadyCreated) {
        throw new TRPCError({
          code: 'CONFLICT',
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
