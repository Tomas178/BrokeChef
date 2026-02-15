import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { integerIdObjectSchema } from '@server/entities/shared';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { recipesPublicArrayOutputSchema } from '../outputSchemas/recipesSchemas';

export default authenticatedProcedure
  .use(provideServices({ collectionsService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/collections/findRecipesByCollectionId/{id}',
      summary: 'Find all recipes in the collection',
      tags: ['Collections'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(recipesPublicArrayOutputSchema)
  .query(async ({ input: { id: collectionId }, ctx: { services } }) =>
    withServiceErrors(async () => {
      const recipesInCollection =
        await services.collectionsService.findRecipesByCollectionId(
          collectionId
        );

      return recipesInCollection;
    })
  );
