import { TRPCError } from '@trpc/server';
import { integerIdSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '../authenticatedProcedure';
import provideRepos from '../provideRepos';
import { collectionsRepository } from '../../repositories/collectionsRepository';

export const collectionAuthorProcedure = authenticatedProcedure
  .use(provideRepos({ collectionsRepository }))
  .input(integerIdSchema)
  .use(async ({ input: collectionId, ctx: { authUser, repos }, next }) => {
    const isAuthor = await repos.collectionsRepository.isAuthor(
      collectionId,
      authUser.id
    );

    if (!isAuthor) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Only author can remove the collection',
      });
    }

    return next();
  });
