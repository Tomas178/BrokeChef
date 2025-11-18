import type { Database } from '@server/database';
import type { CollectionsRecipesLink } from '@server/repositories/collectionsRecipesRepository';
import { collectionsRecipesRepository as buildCollectionsRecipesRepository } from '@server/repositories/collectionsRecipesRepository';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { collectionsRepository as buildCollectionsRepository } from '@server/repositories/collectionsRepository';
import { assertError, assertPostgresError } from '@server/utils/errors';
import { NoResultError } from 'kysely';
import CollectionRecipeLinkNotFound from '@server/utils/errors/collections/CollectionRecipeLinkNotFound';
import CollectionRecipesLinkAlreadyExists from '@server/utils/errors/collections/CollectionRecipeLinkAlreadyExists';
import { PostgresError } from 'pg-error-enum';
import { validateCollectionExists } from './utils/collectionValidations';
import { validateRecipeExists } from './utils/recipeValidations';

export interface CollectionsRecipesService {
  create: (link: CollectionsRecipesLink) => Promise<CollectionsRecipesLink>;
  remove: (
    link: CollectionsRecipesLink
  ) => Promise<CollectionsRecipesLink | undefined>;
}

export function collectionsRecipesService(
  database: Database
): CollectionsRecipesService {
  const collectionsRecipesRepository =
    buildCollectionsRecipesRepository(database);
  const recipesRepository = buildRecipesRepository(database);
  const collectionsRepository = buildCollectionsRepository(database);

  return {
    async create(link) {
      await validateRecipeExists(recipesRepository, link.recipeId);
      await validateCollectionExists(collectionsRepository, link.collectionId);

      try {
        const createdLink = await collectionsRecipesRepository.create(link);

        return createdLink;
      } catch (error) {
        assertPostgresError(error);

        if (error.code === PostgresError.UNIQUE_VIOLATION) {
          throw new CollectionRecipesLinkAlreadyExists();
        }

        throw error;
      }
    },

    async remove(link) {
      await validateRecipeExists(recipesRepository, link.recipeId);
      await validateCollectionExists(collectionsRepository, link.collectionId);

      try {
        const removedLink = await collectionsRecipesRepository.remove(link);

        return removedLink;
      } catch (error) {
        assertError(error);

        if (error instanceof NoResultError) {
          throw new CollectionRecipeLinkNotFound();
        }
      }
    },
  };
}
