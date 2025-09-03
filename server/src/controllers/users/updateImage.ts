import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import * as z from 'zod';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { TRPCError } from '@trpc/server';
import { signImages } from '@server/utils/signImages';
import provideServices from '@server/trpc/provideServices';
import { usersService } from '@server/services/usersService';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .input(z.string().nonempty())
  .mutation(async ({ input: imageUrl, ctx: { authUser, services } }) => {
    try {
      let updated = await services.usersService.updateImage(
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

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user image',
        cause: error,
      });
    }
  });
