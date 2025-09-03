import { createCallerFactory } from '@server/trpc';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { usersKeysPublicWithoutId } from '@server/entities/users';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import * as deleteFileModule from '@server/utils/AWSS3Client/deleteFile';
import type { Mock } from 'vitest';
import { S3ServiceException } from '@aws-sdk/client-s3';
import type { __ServiceExceptionOptions } from '@aws-sdk/client-s3/dist-types/models/S3ServiceException';
import type { RecipesPublic } from '@server/entities/recipes';
import recipesRouter from '..';

vi.mock('@server/utils/AWSS3Client/deleteFile', () => ({
  deleteFile: vi.fn(),
}));

const deleteFileMocked = deleteFileModule.deleteFile as Mock;

const createCaller = createCallerFactory(recipesRouter);

const authUser = {
  id: 'a'.repeat(32),
};

const repos = {
  recipesRepository: {
    isAuthor: vi.fn(async (): Promise<boolean> => true),
    remove: vi.fn(
      async (id: number): Promise<RecipesPublic> =>
        fakeRecipe({
          id,
          userId: authUser.id,
          author: pick(
            fakeUser({ id: authUser.id + 1 }),
            usersKeysPublicWithoutId
          ),
        })
    ),
  } satisfies Partial<RecipesRepository>,
};

const { remove } = createCaller({ repos, authUser } as any);

const recipeId = 26;

beforeEach(() => vi.resetAllMocks());

it('Should remove a recipe', async () => {
  deleteFileMocked.mockResolvedValueOnce(undefined);

  const removedRecipe = await remove(recipeId);

  expect(removedRecipe).toBeUndefined();

  expect(repos.recipesRepository.remove).toHaveBeenCalledOnce();
  expect(repos.recipesRepository.remove).toHaveBeenCalledWith(recipeId);

  expect(deleteFileMocked).toHaveBeenCalledOnce();
});

it('Should throw an error if recipe does not exist', async () => {
  repos.recipesRepository.remove.mockRejectedValueOnce(new RecipeNotFound());

  await expect(remove(recipeId)).rejects.toThrow(
    /recipe.*not found|not found.*recipe/i
  );

  expect(repos.recipesRepository.remove).toHaveBeenCalledOnce();

  expect(deleteFileMocked).toBeCalledTimes(0);
});

it('Should throw an error if user is not an owner of recipe', async () => {
  repos.recipesRepository.isAuthor.mockResolvedValueOnce(false);

  await expect(remove(recipeId)).rejects.toThrow(/recipe/i);

  expect(repos.recipesRepository.remove).toHaveBeenCalledTimes(0);

  expect(deleteFileMocked).toBeCalledTimes(0);
});

it('Should throw an error is an error from S3 Storage was thrown', async () => {
  deleteFileMocked.mockRejectedValueOnce(
    new S3ServiceException({
      message: 'S3 Failure',
    } as __ServiceExceptionOptions)
  );

  await expect(remove(recipeId)).rejects.toThrow(/failed/i);

  expect(repos.recipesRepository.remove).toHaveBeenCalledOnce();

  expect(deleteFileMocked).toHaveBeenCalledOnce();
});
