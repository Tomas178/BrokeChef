import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import { integerIdObjectSchema } from '@server/entities/shared';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { ratingOptionalSchema } from '@server/entities/ratings';

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/ratings/remove',
      summary: 'Remove rating for recipe',
      tags: ['Ratings'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(ratingOptionalSchema.nullable())
  .mutation(async ({ input: { id: recipeId }, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const ratingAfterRemoval = await services.ratingsService.remove(
        authUser.id,
        recipeId
      );

      return ratingAfterRemoval;
    })
  );
