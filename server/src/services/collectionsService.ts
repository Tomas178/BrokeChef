import type { Database } from '@server/database';
import type {
  CollectionsPublic,
  CreateCollectionInput,
} from '@server/entities/collections';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import { ImageFolder } from '@server/enums/ImageFolder';
import logger from '@server/logger';
import { collectionsRepository as buildCollectionsRepository } from '@server/repositories/collectionsRepository';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { uploadImage } from '@server/utils/AWSS3Client/uploadImage';
import { ai } from '@server/utils/GoogleGenAiClient/client';
import { generateCollectionImage } from '@server/utils/GoogleGenAiClient/generateCollectionImage';
import { assertPostgresError } from '@server/utils/errors';
import { PostgresError } from 'pg-error-enum';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import CollectionAlreadyCreated from '@server/utils/errors/collections/CollectionAlreadyCreated';
import { usersRepository as buildUsersRepository } from '@server/repositories/usersRepository';
import { deleteFile } from '@server/utils/AWSS3Client/deleteFile';
import config from '@server/config';
import { signImages } from '@server/utils/signImages';
import { rollbackImageUpload } from './utils/rollbackImageUpload';
import { validateUserExists } from './utils/userValidations';
import { validateCollectionExists } from './utils/collectionValidations';

export interface CollectionsService {
  create: (
    dataForCollection: CreateCollectionInput
  ) => Promise<CollectionsPublic | undefined>;
  findById: (id: number) => Promise<CollectionsPublic | undefined>;
  totalCollectionsByUser: (userId: string) => Promise<number>;
  remove: (id: number) => Promise<CollectionsPublic>;
}

async function handleCollectionImageGeneration(
  userProvidedUrl: string | undefined,
  collectionTitle: string
): Promise<string> {
  if (userProvidedUrl) {
    return userProvidedUrl;
  }

  const generatedImage = await generateCollectionImage(ai, collectionTitle);

  return await uploadImage(
    s3Client,
    ImageFolder.COLLECTIONS,
    generatedImage,
    AllowedMimeType.JPEG
  );
}

export function collectionsService(database: Database): CollectionsService {
  const collectionsRepository = buildCollectionsRepository(database);
  const usersRepository = buildUsersRepository(database);

  return {
    async create(dataForCollection) {
      let imageUrl: string;

      try {
        imageUrl = await handleCollectionImageGeneration(
          dataForCollection.imageUrl,
          dataForCollection.title
        );
      } catch (error) {
        logger.error('Failed to generate collection image:', error);
        throw error;
      }

      const collectionToInsert = {
        ...dataForCollection,
        imageUrl,
      };

      try {
        const createdCollection =
          await collectionsRepository.create(collectionToInsert);

        logger.info(
          `User: ${createdCollection.userId} created collection with ID: ${createdCollection.id}`
        );

        return createdCollection;
      } catch (error) {
        logger.error('Failed to create collection', error);
        await rollbackImageUpload(imageUrl);

        assertPostgresError(error);

        if (error.code === PostgresError.FOREIGN_KEY_VIOLATION) {
          throw new UserNotFound();
        }

        if (error.code === PostgresError.UNIQUE_VIOLATION) {
          throw new CollectionAlreadyCreated();
        }
      }
    },

    async findById(id) {
      const collection = await validateCollectionExists(
        collectionsRepository,
        id
      );

      collection.imageUrl = await signImages(collection.imageUrl);

      return collection;
    },

    async totalCollectionsByUser(userId) {
      await validateUserExists(usersRepository, userId);

      const count = await collectionsRepository.totalCollectionsByUser(userId);

      return count;
    },

    async remove(id) {
      await validateCollectionExists(collectionsRepository, id);

      const removedCollection = await collectionsRepository.remove(id);
      const { id: collectionId, userId, imageUrl } = removedCollection;

      logger.info(`Collection: ${collectionId} removed by user: ${userId}`);

      try {
        await deleteFile(s3Client, config.auth.aws.s3.buckets.images, imageUrl);
        logger.info(
          `Deleted image: ${imageUrl} for collection ${collectionId}`
        );
      } catch (error) {
        logger.error(
          `Failed to delete S3 image for collection ${collectionId} removed by user: ${userId}`
        );
        throw error;
      }

      return removedCollection;
    },
  };
}
