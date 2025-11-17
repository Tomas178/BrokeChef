import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { oauthUserIdSchema } from '@server/entities/shared';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .input(oauthUserIdSchema.nullish())
  .query(async ({ input: userId, ctx: { authUser, services } }) => {
    try {
      userId = userId ?? authUser.id;

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

      throw error;
    }
  });
