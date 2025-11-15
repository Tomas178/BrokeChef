import type { CollectionsRecipes, Database } from '@server/database';
import {
  collectionsRecipesKeysPublic,
  type CollectionsRecipesPublic,
} from '@server/entities/collectionsRecipes';
import type { Insertable } from 'kysely';

const TABLE = 'collectionsRecipes';

export type CollectionsRecipesLink = Insertable<CollectionsRecipes>;

export interface CollectionsRecipesRepository {
  create: (link: CollectionsRecipesLink) => Promise<CollectionsRecipesPublic>;
  remove: (link: CollectionsRecipesLink) => Promise<CollectionsRecipesPublic>;
}

export function collectionsRecipesRepository(
  database: Database
): CollectionsRecipesRepository {
  return {
    async create(link) {
      return database
        .insertInto(TABLE)
        .values(link)
        .returning(collectionsRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(link) {
      return database
        .deleteFrom(TABLE)
        .where('collectionId', '=', link.collectionId)
        .where('recipeId', '=', link.recipeId)
        .returning(collectionsRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}
