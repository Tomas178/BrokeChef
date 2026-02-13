import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import * as z from 'zod';
import provideServices from '@server/trpc/provideServices';
import { usersService } from '@server/services/usersService';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .input(z.string().nonempty())
  .mutation(async ({ input: imageUrl, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const updated = await services.usersService.updateImage(
        authUser.id,
        imageUrl
      );

      return updated;
    })
  );
