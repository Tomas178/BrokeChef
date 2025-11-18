import type { Database } from '@server/database';
import type { CollectionsRecipesRepository } from '@server/repositories/collectionsRecipesRepository';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { fakeCollectionRecipe } from '@server/entities/tests/fakes';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import { NoResultError } from 'kysely';
import CollectionRecipeLinkNotFound from '@server/utils/errors/collections/CollectionRecipeLinkNotFound';
import { PostgresError } from 'pg-error-enum';
import CollectionRecipesLinkAlreadyExists from '@server/utils/errors/collections/CollectionRecipeLinkAlreadyExists';
import { collectionsRecipesService } from '../collectionsRecipesService';

vi.mock('@server/utils/errors', () => ({
  assertPostgresError: vi.fn(),
  assertError: vi.fn(),
}));

const { mockValidateRecipeExists, mockValidateCollectionExists } = vi.hoisted(
  () => ({
    mockValidateRecipeExists: vi.fn(),
    mockValidateCollectionExists: vi.fn(),
  })
);

vi.mock('@server/services/utils/recipeValidations', () => ({
  validateRecipeExists: mockValidateRecipeExists,
}));

vi.mock('@server/services/utils/collectionValidations', () => ({
  validateCollectionExists: mockValidateCollectionExists,
}));

const mockCollectionsRecipesRepoCreate = vi.fn();
const mockCollectionsRecipesRepoRemove = vi.fn();

const mockCollectionsRecipesRepository = {
  create: mockCollectionsRecipesRepoCreate,
  remove: mockCollectionsRecipesRepoRemove,
} as Partial<CollectionsRecipesRepository>;

vi.mock('@server/repositories/collectionsRecipesRepository', () => ({
  collectionsRecipesRepository: () => mockCollectionsRecipesRepository,
}));

const database = {} as Database;
const service = collectionsRecipesService(database);

const collectionsRecipesLink = fakeCollectionRecipe();

describe('create', () => {
  it('Should throw an error if Recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(service.create(collectionsRecipesLink)).rejects.toThrowError(
      RecipeNotFound
    );

    expect(mockCollectionsRecipesRepoCreate).not.toHaveBeenCalled();
  });

  it('Should throw an error if Collection does not exist', async () => {
    mockValidateCollectionExists.mockRejectedValueOnce(
      new CollectionNotFound()
    );

    await expect(service.create(collectionsRecipesLink)).rejects.toThrowError(
      CollectionNotFound
    );

    expect(mockCollectionsRecipesRepoCreate).not.toHaveBeenCalled();
  });

  it('Should throw an error if recpie is already saved in this collection', async () => {
    mockCollectionsRecipesRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(service.create(collectionsRecipesLink)).rejects.toThrowError(
      CollectionRecipesLinkAlreadyExists
    );
  });

  it('Should rethrow any other error', async () => {
    const errorMessage = 'Something happened';
    mockCollectionsRecipesRepoCreate.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(service.create(collectionsRecipesLink)).rejects.toThrow(
      errorMessage
    );
  });

  it('Should create the collections recipes link', async () => {
    mockCollectionsRecipesRepoCreate.mockResolvedValueOnce(
      collectionsRecipesLink
    );

    const createdLink = await service.create(collectionsRecipesLink);

    expect(createdLink).toEqual(collectionsRecipesLink);
  });
});

describe('remove', () => {
  it('Should throw an error if Recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(service.remove(collectionsRecipesLink)).rejects.toThrowError(
      RecipeNotFound
    );

    expect(mockCollectionsRecipesRepoRemove).not.toHaveBeenCalled();
  });

  it('Should throw an error if Collection does not exist', async () => {
    mockValidateCollectionExists.mockRejectedValueOnce(
      new CollectionNotFound()
    );

    await expect(service.remove(collectionsRecipesLink)).rejects.toThrowError(
      CollectionNotFound
    );

    expect(mockCollectionsRecipesRepoRemove).not.toHaveBeenCalled();
  });

  it('Should throw an error if collections recipes link does not exist in database', async () => {
    mockCollectionsRecipesRepoRemove.mockRejectedValueOnce(
      new NoResultError({} as any)
    );

    await expect(service.remove(collectionsRecipesLink)).rejects.toThrowError(
      CollectionRecipeLinkNotFound
    );
  });

  it('Should remove the link', async () => {
    mockCollectionsRecipesRepoRemove.mockResolvedValueOnce(
      collectionsRecipesLink
    );

    const removedLink = await service.remove(collectionsRecipesLink);

    expect(removedLink).toEqual(collectionsRecipesLink);
  });
});
