import { TRPCError } from '@trpc/server';
import { integerIdObjectSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '../authenticatedProcedure';
import provideRepos from '../provideRepos';
import { collectionsRepository } from '../../repositories/collectionsRepository';

export const collectionAuthorProcedure = authenticatedProcedure
  .use(provideRepos({ collectionsRepository }))
  .input(integerIdObjectSchema)
  .use(
    async ({ input: { id: collectionId }, ctx: { authUser, repos }, next }) => {
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
    }
  );
