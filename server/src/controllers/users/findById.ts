import { oauthUserIdSchema } from '@server/entities/shared';
import provideRepos from '@server/trpc/provideRepos';
import { usersRepository } from '@server/repositories/usersRepository';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideRepos({ usersRepository }))
  .input(oauthUserIdSchema.optional())
  .query(async ({ input: userId, ctx: { authUser, repos } }) => {
    try {
      const user = await (userId
        ? repos.usersRepository.findById(userId)
        : repos.usersRepository.findById(authUser.id));

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
