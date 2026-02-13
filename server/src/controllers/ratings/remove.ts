import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import { integerIdSchema } from '@server/entities/shared';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const ratingAfterRemoval = await services.ratingsService.remove(
        authUser.id,
        recipeId
      );

      return ratingAfterRemoval;
    })
  );
