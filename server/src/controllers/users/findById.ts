import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { oauthUserIdSchema } from '@server/entities/shared';
import { usersService } from '@server/services/usersService';

export default publicProcedure
  .use(provideServices({ usersService }))
  .input(oauthUserIdSchema)
  .query(async ({ input: userId, ctx: { services } }) => {
    const user = await services.usersService.findById(userId);

    return user;
  });
