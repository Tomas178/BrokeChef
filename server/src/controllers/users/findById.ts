import { publicProcedure } from '@server/trpc';
import { oauthUserIdSchema } from '@server/entities/shared';
import provideRepos from '@server/trpc/provideRepos';
import { usersRepository } from '@server/repositories/usersRepository';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';

export default publicProcedure
  .use(provideRepos({ usersRepository }))
  .input(oauthUserIdSchema)
  .query(async ({ input: userId, ctx: { repos } }) => {
    try {
      const user = await repos.usersRepository.findById(userId);

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
