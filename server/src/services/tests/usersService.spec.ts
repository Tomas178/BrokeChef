const { mockDeleteFile, mockUpdateImage, mockLoggerError } = vi.hoisted(() => ({
  mockDeleteFile: vi.fn(),
  mockUpdateImage: vi.fn(),
  mockLoggerError: vi.fn(),
}));

vi.mock('@server/utils/AWSS3Client/deleteFile', () => ({
  deleteFile: mockDeleteFile,
}));

vi.mock('@server/logger', () => ({
  default: {
    info: vi.fn(),
    error: mockLoggerError,
  },
}));

import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { initialPage } from '@server/entities/shared';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import {
  usersKeysPublic,
  usersKeysPublicWithoutId,
} from '@server/entities/users';
import { usersService } from '../usersService';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@server/repositories/usersRepository', async () => {
  const actual: any = await vi.importActual(
    '@server/repositories/usersRepository'
  );
  return {
    ...actual,
    usersRepository: (database_: any) => ({
      ...actual.usersRepository(database_),
      updateImage: mockUpdateImage,
    }),
  };
});

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => fakeImageUrl),
}));

const database = await wrapInRollbacks(createTestDatabase());
const service = usersService(database);

const [user] = await insertAll(database, 'users', fakeUser());

const [createdRecipeOne, createdRecipeTwo] = await insertAll(
  database,
  'recipes',
  [fakeRecipe({ userId: user.id }), fakeRecipe({ userId: user.id })]
);

describe('getRecipes', () => {
  it('Should return created and saved recipes by user', async () => {
    await insertAll(database, 'savedRecipes', [
      fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeOne.id }),
      fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeTwo.id }),
    ]);

    const { saved, created } = await service.getRecipes(user.id, initialPage);

    const [createdNew, createdOld] = created;
    const [savedNew, savedOld] = saved;

    // Check created recipes ordered descendingly by id
    expect(createdOld).toEqual({
      ...pick(createdRecipeOne, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      rating: null,
    });

    expect(createdNew).toEqual({
      ...pick(createdRecipeTwo, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      rating: null,
    });

    // Check saved recipes ordered descendingly by id
    expect(savedOld).toEqual({
      ...pick(createdRecipeOne, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      rating: null,
    });

    expect(savedNew).toEqual({
      ...pick(createdRecipeTwo, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      rating: null,
    });
  });
});

describe('getCreatedRecipes', () => {
  it('Should return created recipes by user', async () => {
    const createdRecipes = await service.getCreatedRecipes(
      user.id,
      initialPage
    );

    const [createdNew, createdOld] = createdRecipes;

    expect(createdOld).toEqual({
      ...pick(createdRecipeOne, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      rating: null,
    });

    expect(createdNew).toEqual({
      ...pick(createdRecipeTwo, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      rating: null,
    });
  });
});

describe('getSavedRecipes', () => {
  it('Should return saved recipes by user', async () => {
    await insertAll(database, 'savedRecipes', [
      fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeOne.id }),
      fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeTwo.id }),
    ]);

    const savedRecipes = await service.getSavedRecipes(user.id, initialPage);

    const [savedNew, savedOld] = savedRecipes;

    expect(savedOld).toEqual({
      ...pick(createdRecipeOne, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      rating: null,
    });

    expect(savedNew).toEqual({
      ...pick(createdRecipeTwo, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
      rating: null,
    });
  });
});

describe('findById', () => {
  it('Should return user by id when image url is undefined', async () => {
    const [userWithUndefined] = await insertAll(
      database,
      'users',
      fakeUser({ image: undefined })
    );

    const userById = await service.findById(userWithUndefined.id);

    expect(userById).toEqual(pick(userWithUndefined, usersKeysPublic));
  });

  it('Should return user by id with not signed url when image is from oauth provider', async () => {
    const userById = await service.findById(user.id);

    expect(userById).toEqual(pick(user, usersKeysPublic));
  });

  it('Should return user with signed url when url is from S3 storage', async () => {
    const [userWithS3] = await insertAll(
      database,
      'users',
      fakeUser({ image: 'image' })
    );

    const userById = await service.findById(userWithS3.id);

    expect(userById).toEqual(pick(userById, usersKeysPublic));
  });
});

describe('updateImage', () => {
  const fakeImage = 'fake-image';

  it('Should update the image', async () => {
    const updatedImage = await service.updateImage(user.id, fakeImage);

    expect(updatedImage).toBe(fakeImageUrl);
  });

  it('Should delete the image from S3 storage on failure', async () => {
    mockUpdateImage.mockRejectedValueOnce(new Error('DB Failed'));

    await expect(service.updateImage(user.id, fakeImage)).rejects.toThrow(
      /db failed/i
    );

    expect(mockDeleteFile).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      fakeImage
    );
  });

  it('Should fail to delete the image on failure to insert to db and do console.error', async () => {
    mockUpdateImage.mockRejectedValueOnce(new Error('DB Failed'));
    mockDeleteFile.mockRejectedValueOnce(new Error('Failed to delete from S3'));

    await expect(service.updateImage(user.id, fakeImage)).rejects.toThrow(
      /db failed/i
    );

    expect(mockDeleteFile).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      fakeImage
    );

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to rollback S3 Object:',
      expect.any(Error)
    );
  });
});
