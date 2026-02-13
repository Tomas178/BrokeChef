import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import { ratingsSchema } from '@server/entities/ratings';
import * as z from 'zod';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export const createRatingSchema = ratingsSchema.pick({
  recipeId: true,
  rating: true,
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/ratings/create',
      summary: 'Rate recipe',
      tags: ['Ratings'],
      protect: true,
    },
  })
  .input(createRatingSchema)
  .output(ratingsSchema.optional())
  .mutation(async ({ input, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const createRatingInput = {
        ...input,
        userId: authUser.id,
      };

      const rating = await services.ratingsService.create(createRatingInput);

      return rating;
    })
  );
