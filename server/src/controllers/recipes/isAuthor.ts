import { booleanSchema, integerIdObjectSchema } from '@server/entities/shared';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideRepos({ recipesRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/recipes/isAuthor',
      summary: 'Check if the user is the author of the recipe',
      tags: ['Recipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(booleanSchema)
  .query(async ({ input: { id: recipeId }, ctx: { authUser, repos } }) => {
    const isAuthor = await repos.recipesRepository.isAuthor(
      recipeId,
      authUser.id
    );

    return isAuthor;
  });
