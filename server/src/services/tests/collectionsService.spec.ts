import type { Database } from '@server/database';
import type { CollectionsRepository } from '@server/repositories/collectionsRepository';
import { PostgresError } from 'pg-error-enum';
import {
  fakeCollection,
  fakeCreateCollectionData,
  fakeRecipe,
} from '@server/entities/tests/fakes';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import CollectionAlreadyCreated from '@server/utils/errors/collections/CollectionAlreadyCreated';
import { USER_ID_LENGTH } from '@server/entities/shared';
import { S3ServiceException } from '@aws-sdk/client-s3';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { collectionsService } from '../collectionsService';
import CollectionNotFound from '../../utils/errors/collections/CollectionNotFound';

const fakeImageKey = 'fakeKey';
const fakeImageUrl = 'https://signed-url.com/folder/image.png';

const {
  mockSignImages,
  mockGenerateCollectionImage,
  mockDeleteFile,
  mockLoggerError,
  mockValidateCollectionExists,
  mockValidateUserExists,
  mockUploadImage,
  mockRollbackImageUpload,
} = vi.hoisted(() => ({
  mockSignImages: vi.fn((images: string | string[]) => {
    if (Array.isArray(images)) {
      return images.map(() => fakeImageUrl);
    }
    return fakeImageUrl;
  }),
  mockGenerateCollectionImage: vi.fn(() => Buffer.from('image')),
  mockDeleteFile: vi.fn(),
  mockLoggerError: vi.fn(),
  mockValidateCollectionExists: vi.fn(),
  mockValidateUserExists: vi.fn(),
  mockUploadImage: vi.fn(() => fakeImageKey),
  mockRollbackImageUpload: vi.fn(),
}));

vi.mock('@server/utils/signImages', () => ({
  signImages: mockSignImages,
}));

vi.mock('@server/logger', () => ({
  default: {
    info: vi.fn(),
    error: mockLoggerError,
  },
}));

vi.mock('@server/utils/errors', () => ({
  assertPostgresError: vi.fn(),
  assertError: vi.fn(),
}));

vi.mock('@server/utils/GoogleGenAiClient/generateCollectionImage', () => ({
  generateCollectionImage: mockGenerateCollectionImage,
}));

vi.mock('@server/utils/AWSS3Client/uploadImage', () => ({
  uploadImage: mockUploadImage,
}));

vi.mock('@server/utils/AWSS3Client/deleteFile', () => ({
  deleteFile: mockDeleteFile,
}));

vi.mock('@server/services/utils/collectionValidations', () => ({
  validateCollectionExists: mockValidateCollectionExists,
}));

vi.mock('@server/services/utils/userValidations', () => ({
  validateUserExists: mockValidateUserExists,
}));

vi.mock('@server/services/utils/rollbackImageUpload', () => ({
  rollbackImageUpload: mockRollbackImageUpload,
}));

const mockCollectionsRepoCreate = vi.fn();
const mockCollectionsRepoFindById = vi.fn();
const mockCollectionsRepoTotalCollectionsByUser = vi.fn();
const mockCollectionsRepoRemove = vi.fn();

const mockCollectionsRepository = {
  create: mockCollectionsRepoCreate,
  findById: mockCollectionsRepoFindById,
  totalCollectionsByUser: mockCollectionsRepoTotalCollectionsByUser,
  remove: mockCollectionsRepoRemove,
} as CollectionsRepository;

vi.mock('@server/repositories/collectionsRepository', () => ({
  collectionsRepository: () => mockCollectionsRepository,
}));

const mockUsersRepoFindById = vi.fn();

const mockUsersRepository = {
  findById: mockUsersRepoFindById,
} as any;

vi.mock('@server/repositories/usersRepository', () => ({
  usersRepository: () => mockUsersRepository,
}));

const mockRecipesRepoFindByCollectionId = vi.fn();

const mockRecipesRepository = {
  findByCollectionId: mockRecipesRepoFindByCollectionId,
} as Partial<RecipesRepository>;

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepository,
}));

const database = {} as Database;
const service = collectionsService(database);

beforeEach(() => vi.resetAllMocks());

const userId = 'a'.repeat(USER_ID_LENGTH);
const collectionId = 123;

describe('create', () => {
  it('Should rethrow and log the error if AI image generation failed', async () => {
    const errorMessage = 'AI Failed';
    mockGenerateCollectionImage.mockRejectedValueOnce(new Error(errorMessage));

    await expect(
      service.create(fakeCreateCollectionData({ imageUrl: undefined }))
    ).rejects.toThrow(errorMessage);

    expect(mockLoggerError).toHaveBeenCalledOnce();
  });

  it('Should throw an error if user does not exist', async () => {
    mockCollectionsRepoCreate.mockRejectedValueOnce({
      code: PostgresError.FOREIGN_KEY_VIOLATION,
    });

    await expect(
      service.create(fakeCreateCollectionData())
    ).rejects.toThrowError(UserNotFound);
  });

  it('Should throw an error if collection already exists with the given title for the user', async () => {
    mockCollectionsRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(
      service.create(fakeCreateCollectionData())
    ).rejects.toThrowError(CollectionAlreadyCreated);
  });

  it('Should rollback the image from S3 if an error occurs upon creating record in database', async () => {
    mockCollectionsRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    const collectionData = fakeCreateCollectionData();
    await expect(service.create(collectionData)).rejects.toThrowError(
      CollectionAlreadyCreated
    );

    expect(mockRollbackImageUpload).toHaveBeenCalledExactlyOnceWith(
      collectionData.imageUrl
    );
    expect(mockLoggerError).toHaveBeenCalledOnce();
  });

  it('Should create a new collection without using AI for image generation when the user provided his own image', async () => {
    const collectionData = fakeCollection();
    mockCollectionsRepoCreate.mockResolvedValueOnce(collectionData);

    const createdCollection = await service.create(
      fakeCreateCollectionData(collectionData)
    );

    expect(mockGenerateCollectionImage).not.toHaveBeenCalled();
    expect(mockUploadImage).not.toHaveBeenCalled();
    expect(mockCollectionsRepoCreate).toHaveBeenCalledExactlyOnceWith(
      collectionData
    );
    expect(createdCollection).toEqual(collectionData);
  });

  it('Should create a new collection with using AI for image generation when the user did not provide his own image', async () => {
    const collectionData = fakeCollection();
    mockCollectionsRepoCreate.mockResolvedValueOnce(collectionData);

    const createdCollection = await service.create(
      fakeCreateCollectionData({ ...collectionData, imageUrl: undefined })
    );

    expect(mockGenerateCollectionImage).toHaveBeenCalledOnce();
    expect(mockUploadImage).toHaveBeenCalled();
    expect(mockCollectionsRepoCreate).toHaveBeenCalledExactlyOnceWith({
      ...collectionData,
      imageUrl: fakeImageKey,
    });
    expect(createdCollection).toEqual(collectionData);
  });
});

describe('findById', () => {
  it('Should throw an error when the collection does not exist', async () => {
    mockValidateCollectionExists.mockRejectedValueOnce(
      new CollectionNotFound()
    );

    await expect(service.findById(collectionId)).rejects.toThrowError(
      CollectionNotFound
    );

    expect(mockValidateCollectionExists).toHaveBeenCalledExactlyOnceWith(
      mockCollectionsRepository,
      collectionId
    );
    expect(mockSignImages).not.toHaveBeenCalled();
  });

  it('Should return the collection with signed image', async () => {
    const collectionData = fakeCollection();
    mockValidateCollectionExists.mockResolvedValueOnce(collectionData);

    const retrievedCollection = await service.findById(collectionId);

    expect(mockSignImages).toHaveBeenCalledOnce();
    expect(retrievedCollection).toEqual({
      ...collectionData,
      imageUrl: fakeImageUrl,
    });
  });
});

describe('findByIdCollectionId', () => {
  it('Should throw an error when the collection does exist', async () => {
    mockValidateCollectionExists.mockRejectedValueOnce(
      new CollectionNotFound()
    );

    await expect(service.findByCollectionId(collectionId)).rejects.toThrowError(
      CollectionNotFound
    );

    expect(mockRecipesRepoFindByCollectionId).not.toHaveBeenCalled();
    expect(mockSignImages).not.toHaveBeenCalled();
  });

  it('Should return an array of one recipe with signed image if there is only one recipe in collection', async () => {
    const recipe = fakeRecipe();
    const imageUrl = recipe.imageUrl;
    mockRecipesRepoFindByCollectionId.mockResolvedValueOnce([recipe]);

    const recipesInCollection = await service.findByCollectionId(collectionId);

    expect(mockRecipesRepoFindByCollectionId).toHaveBeenCalledExactlyOnceWith(
      collectionId
    );
    expect(mockSignImages).toHaveBeenCalledExactlyOnceWith([imageUrl]);

    expect(recipesInCollection).toEqual([
      { ...recipe, imageUrl: fakeImageUrl },
    ]);
  });

  it('Should return an array of multiple recipes with signed images', async () => {
    mockValidateCollectionExists.mockResolvedValueOnce(undefined);

    const recipes = [fakeRecipe(), fakeRecipe(), fakeRecipe()];
    const imageUrls = recipes.map(recipe => recipe.imageUrl);
    mockRecipesRepoFindByCollectionId.mockResolvedValueOnce(recipes);

    const recipesInCollection = await service.findByCollectionId(collectionId);

    expect(mockValidateCollectionExists).toHaveBeenCalledExactlyOnceWith(
      mockCollectionsRepository,
      collectionId
    );
    expect(mockRecipesRepoFindByCollectionId).toHaveBeenCalledExactlyOnceWith(
      collectionId
    );
    expect(mockSignImages).toHaveBeenCalledExactlyOnceWith(imageUrls);
    expect(recipesInCollection).toHaveLength(3);
    expect(recipesInCollection).toEqual([
      { ...recipes[0], imageUrl: fakeImageUrl },
      { ...recipes[1], imageUrl: fakeImageUrl },
      { ...recipes[2], imageUrl: fakeImageUrl },
    ]);
  });
});

describe('totalCollectionsByUser', () => {
  it('Should throw an error when the user does not exist', async () => {
    mockValidateUserExists.mockRejectedValueOnce(new UserNotFound());

    await expect(service.totalCollectionsByUser(userId)).rejects.toThrowError(
      UserNotFound
    );

    expect(mockValidateUserExists).toHaveBeenCalledExactlyOnceWith(
      mockUsersRepository,
      userId
    );

    expect(mockCollectionsRepoTotalCollectionsByUser).not.toHaveBeenCalled();
  });

  it('Should return the total amount of collections that user has', async () => {
    const totalCollections = 5;
    mockCollectionsRepoTotalCollectionsByUser.mockResolvedValueOnce(
      totalCollections
    );

    const result = await service.totalCollectionsByUser(userId);

    expect(mockValidateUserExists).toHaveBeenCalledExactlyOnceWith(
      mockUsersRepository,
      userId
    );
    expect(
      mockCollectionsRepoTotalCollectionsByUser
    ).toHaveBeenCalledExactlyOnceWith(userId);
    expect(result).toBe(totalCollections);
  });
});

describe('remove', () => {
  it('Should throw an error if collection with given id does not exist', async () => {
    mockValidateCollectionExists.mockRejectedValueOnce(
      new CollectionNotFound()
    );

    await expect(service.remove(collectionId)).rejects.toThrowError(
      CollectionNotFound
    );

    expect(mockValidateCollectionExists).toHaveBeenCalledExactlyOnceWith(
      mockCollectionsRepository,
      collectionId
    );
    expect(mockCollectionsRepoRemove).not.toHaveBeenCalled();
    expect(mockDeleteFile).not.toHaveBeenCalled();
  });

  it('Should rethrow an error when error occured upon deleting S3 object', async () => {
    mockDeleteFile.mockRejectedValueOnce(new S3ServiceException({} as any));

    const collectionData = fakeCollection();
    mockCollectionsRepoRemove.mockResolvedValueOnce(collectionData);

    await expect(service.remove(collectionId)).rejects.toThrowError(
      S3ServiceException
    );
  });

  it('Should remove the collection database and its image from S3', async () => {
    const collectionData = fakeCollection();
    mockCollectionsRepoRemove.mockResolvedValueOnce(collectionData);

    const deletedCollection = await service.remove(collectionId);

    expect(mockDeleteFile).toHaveBeenCalledOnce();
    expect(deletedCollection).toEqual(collectionData);
  });
});
