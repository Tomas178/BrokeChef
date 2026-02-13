import { oauthUserIdSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { usersService } from '@server/services/usersService';
import provideServices from '@server/trpc/provideServices';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .input(oauthUserIdSchema.nullish())
  .query(async ({ input: userId, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      userId = userId ?? authUser.id;

      const user = await services.usersService.findById(userId);

      return user;
    })
  );
