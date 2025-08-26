import { recipesSchema } from '@server/entities/recipes';
import { arrayStringSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import * as z from 'zod';
import { recipesService } from '@server/services/recipesService';
import { TRPCError } from '@trpc/server';
import UserNotFound from '@server/utils/errors/users/UserNotFound';

const createRecipeInputSchema = recipesSchema
  .pick({
    title: true,
    duration: true,
    steps: true,
  })
  .extend({
    ingredients: arrayStringSchema,
    tools: arrayStringSchema,
  });

export type CreateRecipeInput = z.infer<typeof createRecipeInputSchema>;

export default authenticatedProcedure
  .use(provideServices({ recipesService }))
  .input(createRecipeInputSchema)
  .mutation(async ({ input, ctx: { authUser, services } }) => {
    try {
      const recipeCreated = await services.recipesService.createRecipe(
        input,
        authUser.id
      );

      return recipeCreated;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }
    }
  });
