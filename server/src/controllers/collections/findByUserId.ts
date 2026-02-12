import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { oauthUserIdSchema } from '@server/entities/shared';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import * as z from 'zod';
import { collectionsPublicBasicSchemaArray } from '@server/controllers/outputSchemas/collectionsSchemas';

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
  .query(async ({ input, ctx: { authUser, services } }) => {
    try {
      const userId = input?.userId ?? authUser.id;

      const collections =
        await services.collectionsService.findByUserId(userId);

      return collections;
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
