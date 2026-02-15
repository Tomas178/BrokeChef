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
      method: 'GET',
      path: '/ratings/{id}',
      summary: 'Get user rating for the recipe',
      tags: ['Ratings'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(ratingOptionalSchema)
  .query(async ({ input: { id: recipeId }, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const rating = await services.ratingsService.getUserRatingForRecipe(
        recipeId,
        authUser.id
      );

      return rating;
    })
  );
