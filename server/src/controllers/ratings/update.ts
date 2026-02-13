import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { ratingOptionalSchema } from '@server/entities/ratings';
import { createRatingSchema } from './create';

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/ratings/update',
      summary: 'Update rating for recipe',
      tags: ['Ratings'],
      protect: true,
    },
  })
  .input(createRatingSchema)
  .output(ratingOptionalSchema)
  .mutation(async ({ input, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const ratingForUpdate = {
        ...input,
        userId: authUser.id,
      };

      const updatedRating =
        await services.ratingsService.update(ratingForUpdate);

      return updatedRating;
    })
  );
