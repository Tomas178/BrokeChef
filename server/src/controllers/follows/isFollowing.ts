import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { followsService } from '@server/services/followsService';
import { oauthUserIdSchema } from '@server/entities/shared';
import type { FollowLink } from '@server/repositories/followsRepository';

export default authenticatedProcedure
  .use(provideServices({ followsService }))
  .input(oauthUserIdSchema)
  .query(async ({ input: followedId, ctx: { services, authUser } }) => {
    const followLink: FollowLink = { followerId: authUser.id, followedId };

    const isFollowing = await services.followsService.isFollowing(followLink);

    return isFollowing;
  });
