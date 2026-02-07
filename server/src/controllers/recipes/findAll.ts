import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { paginationWithSortSchema } from '@server/entities/shared';
import * as z from 'zod';
import { recipesSchema } from '@server/entities/recipes';
import { usersPublicWithoutIdSchema } from '@server/entities/users';
import { ratingOptionalSchema } from '@server/entities/ratings';

const outputSchema = z.array(
  recipesSchema.omit({ embedding: true, steps: true }).extend({
    author: usersPublicWithoutIdSchema,
    rating: ratingOptionalSchema,
    steps: z.string().nonempty().trim(),
  })
);

export default publicProcedure
  .use(
    provideServices({
      recipesService,
    })
  )
  .meta({
    openapi: {
      method: 'GET',
      path: '/recipes/all',
      summary: 'Fetch all recipes',
      tags: ['Recipes'],
    },
  })
  .input(paginationWithSortSchema)
  .output(outputSchema)
  .query(async ({ input: paginationWithSort, ctx: { services } }) => {
    const recipes = await services.recipesService.findAll(paginationWithSort);

    return recipes;
  });
