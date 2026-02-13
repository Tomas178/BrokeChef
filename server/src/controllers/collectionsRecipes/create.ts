import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsRecipesService } from '@server/services/collectionsRecipesService';
import type { CollectionsRecipesLink } from '@server/repositories/collectionsRecipesRepository';
import { collectionsRecipesRequest } from '@server/entities/collectionsRecipes';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ collectionsRecipesService }))
  .input(collectionsRecipesRequest)
  .mutation(async ({ input, ctx: { services } }) =>
    withServiceErrors(async () => {
      const link: CollectionsRecipesLink = {
        collectionId: input.collectionId,
        recipeId: input.recipeId,
      };

      const createdLink = await services.collectionsRecipesService.create(link);
      return createdLink;
    })
  );
