import { recipesSchema } from '@server/entities/recipes';
import { ingredientToolNameSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import * as z from 'zod';
import { recipesService } from '@server/services/recipesService';

const createRecipeInputSchema = recipesSchema
  .pick({
    title: true,
    duration: true,
    steps: true,
  })
  .extend({
    ingredients: z.array(ingredientToolNameSchema),
    tools: z.array(ingredientToolNameSchema),
  });

export type createRecipeInput = z.infer<typeof createRecipeInputSchema>;

export default authenticatedProcedure
  .use(provideServices({ recipesService }))
  .input(createRecipeInputSchema)
  .mutation(async ({ input, ctx: { authUser, services } }) => {
    const recipeCreated = await services.recipesService.createRecipe(
      input,
      authUser.id
    );

    return recipeCreated;
  });
