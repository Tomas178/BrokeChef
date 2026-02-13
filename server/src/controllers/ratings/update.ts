import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { createRatingSchema } from './create';

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .input(createRatingSchema)
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
