import type { Database } from '@server/database';
import type { RecipesPublic } from '@server/entities/recipes';
import type { UsersPublic } from '@server/entities/users';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { usersRepository as buildUsersRepository } from '@server/repositories/usersRepository';
import type { Pagination } from '@server/shared/pagination';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { deleteFile } from '@server/utils/AWSS3Client/deleteFile';
import { signImages } from '@server/utils/signImages';
import config from '@server/config';
import logger from '@server/logger';
import { isOAuthProviderImage } from './utils/isOAuthProviderImage';
import { assignSignedUrls } from './utils/assignSignedUrls';

export interface UsersService {
  getRecipes: (
    id: string,
    pagination: Pagination
  ) => Promise<{
    created: RecipesPublic[];
    saved: RecipesPublic[];
  }>;
  getCreatedRecipes: (
    id: string,
    pagination: Pagination
  ) => Promise<RecipesPublic[]>;
  getSavedRecipes: (
    id: string,
    pagination: Pagination
  ) => Promise<RecipesPublic[]>;
  findById: (id: string) => Promise<UsersPublic>;
  updateImage: (id: string, image: string) => Promise<string>;
}

export function usersService(database: Database): UsersService {
  const recipesRepository = buildRecipesRepository(database);
  const usersRepository = buildUsersRepository(database);

  return {
    async getRecipes(id, pagination) {
      const [created, saved] = await Promise.all([
        recipesRepository.findCreatedByUser(id, pagination),
        recipesRepository.findSavedByUser(id, pagination),
      ]);

      const [assignedCreatedRecipes, assignedSavedRecipes] = await Promise.all([
        assignSignedUrls(created),
        assignSignedUrls(saved),
      ]);

      return { created: assignedCreatedRecipes, saved: assignedSavedRecipes };
    },

    async getCreatedRecipes(id, pagination) {
      const createdRecipes = await recipesRepository.findCreatedByUser(
        id,
        pagination
      );

      const assignedRecipes = await assignSignedUrls(createdRecipes);

      return assignedRecipes;
    },

    async getSavedRecipes(id, pagination) {
      const savedRecipes = await recipesRepository.findSavedByUser(
        id,
        pagination
      );

      const assignedRecipes = await assignSignedUrls(savedRecipes);

      return assignedRecipes;
    },

    async findById(id) {
      const user = await usersRepository.findById(id);

      if (user.image && !isOAuthProviderImage(user.image)) {
        user.image = await signImages(user.image);
      }

      return user;
    },

    async updateImage(userId, image) {
      let userById: UsersPublic | undefined;
      let isOAuthImage: boolean;
      let isCurrentImageUrlDeleted = false;

      try {
        userById = await usersRepository.findById(userId);
        const currentImageUrl = userById.image;
        isOAuthImage = isOAuthProviderImage(userById?.image);

        if (currentImageUrl && !isOAuthImage) {
          await deleteFile(
            s3Client,
            config.auth.aws.s3.buckets.images,
            currentImageUrl
          );

          isCurrentImageUrlDeleted = true;
          logger.info(
            `Old image url: ${currentImageUrl} deleted from S3 object for user: ${userId}`
          );
        }
      } catch {
        if (!isCurrentImageUrlDeleted) {
          logger.error(
            `Failed to delete old S3 object: ${userById?.image}. Remove it manually from bucket: ${config.auth.aws.s3.buckets.images}`
          );
        }
      }

      try {
        const updatedUrl = await usersRepository.updateImage(userId, image);

        const signedUrl = await signImages(updatedUrl);

        logger.info(`New image url updated for user: ${userId}`);

        return signedUrl;
      } catch (error) {
        try {
          await deleteFile(s3Client, config.auth.aws.s3.buckets.images, image);
        } catch (S3Error) {
          logger.error('Failed to rollback S3 Object:', S3Error);
        }

        throw error;
      }
    },
  };
}
