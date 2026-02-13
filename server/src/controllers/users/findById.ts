import { oauthUserIdObjectNullishSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { usersService } from '@server/services/usersService';
import provideServices from '@server/trpc/provideServices';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { usersPublicImageNullableSchema } from '@server/entities/users';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/users/findById',
      summary: 'Get user by ID',
      tags: ['Users'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectNullishSchema)
  .output(usersPublicImageNullableSchema)
  .query(async ({ input, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const userId = input?.userId ?? authUser.id;

      const user = await services.usersService.findById(userId);

      return user;
    })
  );
