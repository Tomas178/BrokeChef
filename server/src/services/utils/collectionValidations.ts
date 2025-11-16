import type { CollectionsRepository } from '@server/repositories/collectionsRepository';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';

export async function validateCollectionExists(
  collectionsRepository: CollectionsRepository,
  collectionId: number
) {
  const collection = await collectionsRepository.findById(collectionId);

  if (!collection) {
    throw new CollectionNotFound();
  }

  return collection;
}
