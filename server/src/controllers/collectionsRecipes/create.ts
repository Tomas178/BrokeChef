import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsRecipesService } from '@server/services/collectionsRecipesService';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { TRPCError } from '@trpc/server';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import type { CollectionsRecipesLink } from '@server/repositories/collectionsRecipesRepository';
import { collectionsRecipesRequest } from '@server/entities/collectionsRecipes';

export default authenticatedProcedure
  .use(provideServices({ collectionsRecipesService }))
  .input(collectionsRecipesRequest)
  .mutation(async ({ input, ctx: { services } }) => {
    try {
      const link: CollectionsRecipesLink = {
        collectionId: input.collectionId,
        recipeId: input.recipeId,
      };

      const createdLink = await services.collectionsRecipesService.create(link);

      return createdLink;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error instanceof CollectionNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      throw error;
    }
  });
