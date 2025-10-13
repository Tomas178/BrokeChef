import { fakeRecipeWithRating, fakeUser } from '@server/entities/tests/fakes';
import { initialPage } from '@server/entities/shared';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import type { UsersRepository } from '@server/repositories/usersRepository';
import type { Database } from '@server/database';
import type { S3Client } from '@aws-sdk/client-s3';
import { usersService } from '../usersService';

const [fakeImageUrl, fakeImageBucket] = vi.hoisted(() => [
  'fake-url',
  'fakeImageBucket',
]);

const mockS3Client = vi.hoisted(() => ({}) as unknown as S3Client);

const mockSignImages = vi.hoisted(() =>
  vi.fn((images: string | string[]) => {
    if (Array.isArray(images)) {
      return images.map(() => fakeImageUrl);
    }
    return fakeImageUrl;
  })
);

const { mockDeleteFile, mockLoggerError, mockIsOAuthProviderImage } =
  vi.hoisted(() => ({
    mockDeleteFile: vi.fn(),
    mockLoggerError: vi.fn(),
    mockIsOAuthProviderImage: vi.fn(),
  }));

const mockConfig = vi.hoisted(() => ({
  auth: {
    aws: {
      s3: {
        buckets: {
          images: fakeImageBucket,
        },
      },
    },
  },
}));

vi.mock('@server/config', () => ({
  default: mockConfig,
}));

vi.mock('@server/utils/AWSS3Client/client', () => ({
  s3Client: mockS3Client,
}));

vi.mock('@server/utils/signImages', () => ({
  signImages: mockSignImages,
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

vi.mock('@server/services/utils/isOAuthProviderImage', () => ({
  isOAuthProviderImage: mockIsOAuthProviderImage,
}));

const mockRecipesRepoFindCreatedByUser = vi.fn();
const mockRecipesRepoFindSavedByUser = vi.fn();

const mockRecipesRepository = {
  findCreatedByUser: mockRecipesRepoFindCreatedByUser,
  findSavedByUser: mockRecipesRepoFindSavedByUser,
} as Partial<RecipesRepository>;

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepository,
}));

const mockUsersRepoFindById = vi.fn();
const mockUsersRepoUpdateImage = vi.fn();

const mockUsersRepository = {
  findById: mockUsersRepoFindById,
  updateImage: mockUsersRepoUpdateImage,
} as UsersRepository;

vi.mock('@server/repositories/usersRepository', () => ({
  usersRepository: () => mockUsersRepository,
}));

const database = {} as Database;
const service = usersService(database);

const user = fakeUser();

const createdRecipes = [
  fakeRecipeWithRating({ userId: user.id }),
  fakeRecipeWithRating({ userId: user.id }),
];

const savedRecipes = [
  fakeRecipeWithRating({ userId: user.id }),
  fakeRecipeWithRating({ userId: user.id }),
];

beforeEach(() => vi.resetAllMocks());

describe('getRecipes', () => {
  it('Should return created and saved recipes by user', async () => {
    mockRecipesRepoFindCreatedByUser.mockResolvedValueOnce(createdRecipes);
    mockRecipesRepoFindSavedByUser.mockResolvedValueOnce(savedRecipes);

    const { saved, created } = await service.getRecipes(user.id, initialPage);

    expect(mockRecipesRepoFindCreatedByUser).toHaveBeenCalledOnce();
    expect(mockRecipesRepoFindSavedByUser).toHaveBeenCalledOnce();
    expect(mockSignImages).toBeCalledTimes(2);

    expect(created).toEqual(createdRecipes);
    expect(saved).toEqual(savedRecipes);
  });
});

describe('getCreatedRecipes', () => {
  it('Should return created recipes by user', async () => {
    mockRecipesRepoFindCreatedByUser.mockResolvedValueOnce(createdRecipes);

    const createdRecipesFromService = await service.getCreatedRecipes(
      user.id,
      initialPage
    );

    expect(mockRecipesRepoFindCreatedByUser).toHaveBeenCalledOnce();
    expect(mockSignImages).toHaveBeenCalledOnce();
    expect(createdRecipesFromService).toEqual(createdRecipes);
  });
});

describe('getSavedRecipes', () => {
  it('Should return saved recipes by user', async () => {
    mockRecipesRepoFindSavedByUser.mockResolvedValueOnce(savedRecipes);

    const savedRecipesFromRepo = await service.getSavedRecipes(
      user.id,
      initialPage
    );

    expect(mockRecipesRepoFindSavedByUser).toHaveBeenCalledOnce();
    expect(mockSignImages).toHaveBeenCalledOnce();
    expect(savedRecipesFromRepo).toEqual(savedRecipes);
  });
});

describe('findById', () => {
  it('Should return user by id when image url is null', async () => {
    const userWithImageNull = fakeUser({ image: null });
    mockUsersRepoFindById.mockResolvedValueOnce(userWithImageNull);

    const userById = await service.findById(userWithImageNull.id);

    expect(mockUsersRepoFindById).toHaveBeenCalledOnce();
    expect(mockSignImages).not.toHaveBeenCalled();
    expect(userById).toEqual(userWithImageNull);
  });

  it('Should return user by id with not signed url when image is from oauth provider', async () => {
    mockUsersRepoFindById.mockResolvedValueOnce(user);
    mockIsOAuthProviderImage.mockResolvedValueOnce(true);

    const userById = await service.findById(user.id);

    expect(mockUsersRepoFindById).toHaveBeenCalledOnce();
    expect(mockSignImages).not.toHaveBeenCalled();
    expect(userById).toEqual(user);
  });

  it('Should return user with signed url when url is from S3 storage', async () => {
    const userWithImageFromS3 = fakeUser({ image: 'image' });
    mockUsersRepoFindById.mockResolvedValueOnce(userWithImageFromS3);

    const userById = await service.findById(userWithImageFromS3.id);

    expect(mockUsersRepoFindById).toHaveBeenCalledOnce();
    expect(mockSignImages).toHaveBeenCalledOnce();
    expect(userById).toEqual(userWithImageFromS3);
  });
});

describe('updateImage', () => {
  const fakeImage = 'fake-image';

  it('Should remove the current image and then update with new image', async () => {
    mockUsersRepoFindById.mockResolvedValueOnce(user);
    mockIsOAuthProviderImage.mockReturnValueOnce(false);
    mockUsersRepoUpdateImage.mockResolvedValueOnce(fakeImageUrl);

    const updatedImage = await service.updateImage(user.id, fakeImage);

    expect(mockUsersRepoFindById).toHaveBeenCalledOnce();
    expect(mockIsOAuthProviderImage).toHaveBeenCalledExactlyOnceWith(
      user.image
    );
    expect(mockDeleteFile).toHaveBeenCalledExactlyOnceWith(
      mockS3Client,
      fakeImageBucket,
      user.image
    );
    expect(mockLoggerError).not.toHaveBeenCalledOnce();

    expect(mockUsersRepoUpdateImage).toHaveBeenCalledOnce();
    expect(mockSignImages).toHaveBeenCalledOnce();
    expect(updatedImage).toBe(fakeImageUrl);
  });

  it('Should fail to remove image from S3, log an error and then update with new image', async () => {
    mockUsersRepoFindById.mockResolvedValueOnce(user);
    mockIsOAuthProviderImage.mockReturnValueOnce(false);
    mockDeleteFile.mockRejectedValueOnce(new Error('Something failed'));
    mockUsersRepoUpdateImage.mockResolvedValueOnce(fakeImageUrl);

    const updatedImage = await service.updateImage(user.id, fakeImage);

    expect(mockIsOAuthProviderImage).toHaveBeenCalledExactlyOnceWith(
      user.image
    );

    expect(mockUsersRepoFindById).toHaveBeenCalledOnce();
    expect(mockIsOAuthProviderImage).toHaveBeenCalledExactlyOnceWith(
      user.image
    );
    expect(mockDeleteFile).toHaveBeenCalledExactlyOnceWith(
      mockS3Client,
      fakeImageBucket,
      user.image
    );

    expect(mockLoggerError).toHaveBeenCalledExactlyOnceWith(
      `Failed to delete old S3 object: ${user.image}. Remove it manually from bucket: ${fakeImageBucket}`
    );

    expect(mockUsersRepoUpdateImage).toHaveBeenCalledOnce();
    expect(mockSignImages).toHaveBeenCalledOnce();
    expect(updatedImage).toBe(fakeImageUrl);
  });

  it('Should ignore the the current file deletion from S3 if the imageUrl is from OAuth provider', async () => {
    mockUsersRepoFindById.mockResolvedValueOnce(user);
    mockIsOAuthProviderImage.mockReturnValueOnce(true);

    await service.updateImage(user.id, fakeImage);

    expect(mockUsersRepoFindById).toHaveBeenCalledExactlyOnceWith(user.id);
    expect(mockIsOAuthProviderImage).toHaveBeenCalledExactlyOnceWith(
      user.image
    );

    expect(mockDeleteFile).not.toHaveBeenCalled();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('Should ignore the the current file deletion from S3 if the imageUrl is from OAuth provider', async () => {
    mockUsersRepoFindById.mockResolvedValueOnce(user);
    mockIsOAuthProviderImage.mockReturnValueOnce(true);

    await service.updateImage(user.id, fakeImage);

    expect(mockUsersRepoFindById).toHaveBeenCalledExactlyOnceWith(user.id);
    expect(mockIsOAuthProviderImage).toHaveBeenCalledExactlyOnceWith(
      user.image
    );

    expect(mockDeleteFile).not.toHaveBeenCalled();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('Should delete the image from S3 storage on failure', async () => {
    const errorMessage = 'DB Failed';
    mockUsersRepoUpdateImage.mockRejectedValueOnce(new Error(errorMessage));

    await expect(service.updateImage(user.id, fakeImage)).rejects.toThrow(
      errorMessage
    );

    expect(mockSignImages).not.toHaveBeenCalled();
    expect(mockDeleteFile).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      fakeImage
    );
  });

  it('Should fail to delete the image on failure to insert to db and log an error', async () => {
    const errorMessage = 'DB Failed';
    mockUsersRepoUpdateImage.mockRejectedValueOnce(new Error(errorMessage));
    mockDeleteFile.mockRejectedValueOnce(new Error('Failed to delete from S3'));

    await expect(service.updateImage(user.id, fakeImage)).rejects.toThrow(
      errorMessage
    );

    expect(mockSignImages).not.toHaveBeenCalled();
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
