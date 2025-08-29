import { TRPCError } from '@trpc/server';
import { recipeAuthorProcedure } from '@server/trpc/recipeAuthorProcedure';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { deleteFile } from '@server/utils/AWSS3Client/deleteFile';
import { s3Client } from '@server/utils/AWSS3Client/client';
import config from '@server/config';
import { S3ServiceException } from '@aws-sdk/client-s3';

export default recipeAuthorProcedure.mutation(
  async ({ input: recipeId, ctx: { repos } }) => {
    try {
      const deletedRecipe = await repos.recipesRepository.remove(recipeId);

      const imageUrl = deletedRecipe.imageUrl.split('/').slice(-2).join('/');

      await deleteFile(s3Client, config.auth.aws.s3.buckets.images, imageUrl);

      return;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe was not found',
        });
      }

      if (error instanceof S3ServiceException) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete recipe image from storate',
        });
      }
    }
  }
);
