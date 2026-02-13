import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import * as z from 'zod';
import provideServices from '@server/trpc/provideServices';
import { usersService } from '@server/services/usersService';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { nonEmptyStringSchema } from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/users/updateImage',
      summary: 'Update image url',
      tags: ['Users'],
      protect: true,
    },
  })
  .input(z.object({ imageUrl: nonEmptyStringSchema }))
  .output(nonEmptyStringSchema)
  .mutation(async ({ input: { imageUrl }, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const updated = await services.usersService.updateImage(
        authUser.id,
        imageUrl
      );

      return updated;
    })
  );
