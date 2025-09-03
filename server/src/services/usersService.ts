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

interface UsersService {
  getRecipes: (
    id: string,
    pagination: Pagination
  ) => Promise<{
    created: RecipesPublic[];
    saved: RecipesPublic[];
  }>;
  findById: (id: string) => Promise<UsersPublic>;
  updateImage: (id: string, image: string) => Promise<string>;
}

export function usersService(database: Database): UsersService {
  const recipesRepository = buildRecipesRepository(database);
  const usersRepository = buildUsersRepository(database);

  return {
    async getRecipes(id, pagination) {
      const [created, saved] = await Promise.all([
        recipesRepository.findCreated(id, pagination),
        recipesRepository.findSaved(id, pagination),
      ]);

      const createdUrls = created.map(recipe => recipe.imageUrl);
      const savedUrls = saved.map(recipe => recipe.imageUrl);

      const [signedCreatedUrls, signedSavedUrls] = await Promise.all([
        signImages(createdUrls),
        signImages(savedUrls),
      ]);

      for (const [index, recipe] of created.entries()) {
        recipe.imageUrl = signedCreatedUrls[index];
      }

      for (const [index, recipe] of saved.entries()) {
        recipe.imageUrl = signedSavedUrls[index];
      }

      return { created, saved };
    },

    async findById(id) {
      const user = await usersRepository.findById(id);

      if (user.image) {
        const isOauthImage =
          user.image.includes('googleusercontent') ||
          user.image.includes('githubusercontent');

        if (!isOauthImage) {
          user.image = await signImages(user.image);
        }
      }

      return user;
    },

    async updateImage(userId, image) {
      try {
        let updated = await usersRepository.updateImage(userId, image);

        updated = await signImages(updated);

        return updated;
      } catch (error) {
        try {
          await deleteFile(s3Client, config.auth.aws.s3.buckets.images, image);
        } catch (S3Error) {
          console.error('Failed to rollback S3 Object:', S3Error);
        }

        throw error;
      }
    },
  };
}
