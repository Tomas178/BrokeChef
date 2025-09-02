import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { usersRepository } from '@server/repositories/usersRepository';
import * as z from 'zod';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import { signImages } from '@server/utils/signImages';

export default authenticatedProcedure
  .use(provideRepos({ usersRepository }))
  .input(z.string().nonempty())
  .mutation(async ({ input: imageUrl, ctx: { authUser, repos } }) => {
    try {
      let updated = await repos.usersRepository.updateImage(
        authUser.id,
        imageUrl
      );

      updated = await signImages(updated);

      return updated;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }
    }
  });
