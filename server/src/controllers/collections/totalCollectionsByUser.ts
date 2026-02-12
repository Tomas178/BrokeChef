import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import {
  nonNegativeIntegerSchema,
  oauthUserIdSchema,
} from '@server/entities/shared';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import * as z from 'zod';

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
  .input(z.object({ userId: oauthUserIdSchema.nullish() }).nullish())
  .output(nonNegativeIntegerSchema)
  .query(async ({ input, ctx: { authUser, services } }) => {
    try {
      const userId = input?.userId ?? authUser.id;

      const totalCount =
        await services.collectionsService.totalCollectionsByUser(userId);

      return totalCount;
    } catch (error) {
      if (error instanceof UserNotFound) {
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
