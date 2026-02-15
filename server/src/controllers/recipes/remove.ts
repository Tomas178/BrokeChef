import { recipeAuthorProcedure } from '@server/trpc/recipeAuthorProcedure';
import { S3ServiceException } from '@aws-sdk/client-s3';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import type { ErrorOverride } from '@server/utils/errors/utils/handleServiceErrors';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import { voidSchema } from '../outputSchemas/shared';

const errorsOverrideList: ErrorOverride[] = [
  {
    errorClass: S3ServiceException,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to delete the recipe',
  },
];

export default recipeAuthorProcedure
  .use(provideServices({ recipesService }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/recipes/{id}',
      summary: 'Delete the recipe',
      tags: ['Recipes'],
      protect: true,
    },
  })
  .output(voidSchema)
  .mutation(async ({ input: { id: recipeId }, ctx: { services } }) =>
    withServiceErrors(async () => {
      await services.recipesService.remove(recipeId);

      return;
    }, errorsOverrideList)
  );
