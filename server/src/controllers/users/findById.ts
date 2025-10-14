import { oauthUserIdSchema } from '@server/entities/shared';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { usersService } from '@server/services/usersService';
import provideServices from '@server/trpc/provideServices';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .input(oauthUserIdSchema.nullish())
  .query(async ({ input: userId, ctx: { authUser, services } }) => {
    try {
      userId = userId ?? authUser.id;

      const user = await services.usersService.findById(userId);

      return user;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }
    }
  });
