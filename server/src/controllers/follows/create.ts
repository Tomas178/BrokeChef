import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdSchema } from '@server/entities/shared';
import type { FollowLink } from '@server/repositories/followsRepository';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .input(oauthUserIdSchema)
  .mutation(async ({ input: followedId, ctx: { services, authUser } }) =>
    withServiceErrors(async () => {
      const followLink: FollowLink = { followerId: authUser.id, followedId };

      const createdFollowLink =
        await services.followsService.create(followLink);

      return createdFollowLink;
    })
  );
