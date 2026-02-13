import { recipesSchema } from '@server/entities/recipes';
import { arrayStringSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import * as z from 'zod';
import { recipesService } from '@server/services/recipesService';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { recipesPublicOutputSchema } from '../outputSchemas/recipesSchemas';

const createRecipeInputSchema = recipesSchema
  .pick({
    title: true,
    duration: true,
    steps: true,
    imageUrl: true,
  })
  .extend({
    ingredients: arrayStringSchema,
    tools: arrayStringSchema,
  });

export type CreateRecipeInput = z.infer<typeof createRecipeInputSchema>;

export default authenticatedProcedure
  .use(provideServices({ recipesService }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/recipes/create',
      summary: 'Create the recipe',
      tags: ['Recipes'],
      protect: true,
    },
  })
  .input(createRecipeInputSchema)
  .output(recipesPublicOutputSchema.optional())
  .mutation(async ({ input, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const recipeCreated = await services.recipesService.createRecipe(
        input,
        authUser.id
      );

      return recipeCreated;
    })
  );
