import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdObjectSchema } from '@server/entities/shared';
import type { FollowLink } from '@server/repositories/followsRepository';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { voidSchema } from '../outputSchemas/shared';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/follows/{userId}',
      summary: 'Unfollow user',
      tags: ['Follows'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectSchema)
  .output(voidSchema)
  .mutation(
    async ({ input: { userId: followedId }, ctx: { services, authUser } }) =>
      withServiceErrors(async () => {
        const unfollowLink: FollowLink = {
          followerId: authUser.id,
          followedId,
        };

        await services.followsService.remove(unfollowLink);

        return;
      })
  );
