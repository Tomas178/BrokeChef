import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdObjectSchema } from '@server/entities/shared';
import type { FollowLink } from '@server/repositories/followsRepository';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { followsSchema } from '@server/entities/follows';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/follows/create',
      summary: 'Follow the user',
      tags: ['Follows'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectSchema)
  .output(followsSchema)
  .mutation(
    async ({ input: { userId: followedId }, ctx: { services, authUser } }) =>
      withServiceErrors(async () => {
        const followLink: FollowLink = { followerId: authUser.id, followedId };

        const createdFollowLink =
          await services.followsService.create(followLink);

        return createdFollowLink;
      })
  );
