import type { CollectionsRepository } from '@server/repositories/collectionsRepository';
import { fakeCollection } from '@server/entities/tests/fakes';
import { validateCollectionExists } from '../collectionValidations';

const collectionData = fakeCollection();
const collectionId = 123;

const mockFindById = vi.fn();

const mockCollectionsRepository = {
  findById: mockFindById,
} as unknown as CollectionsRepository;

describe('validateCollectionExists', () => {
  it('Should return collection when collection exists', async () => {
    mockFindById.mockResolvedValueOnce(collectionData);
    const collectionFromRepo = await validateCollectionExists(
      mockCollectionsRepository,
      collectionId
    );

    expect(collectionFromRepo).toBe(collectionData);
  });

  it('Should throw an error when collection does not exist', async () => {
    mockFindById.mockResolvedValueOnce(undefined);

    await expect(
      validateCollectionExists(mockCollectionsRepository, collectionId)
    ).rejects.toThrow(/not found/i);
  });

  it('Should throw general failure message if any other error occurs', async () => {
    const errorMessage = 'Something failed';

    mockFindById.mockRejectedValueOnce(new Error(errorMessage));

    await expect(
      validateCollectionExists(mockCollectionsRepository, collectionId)
    ).rejects.toThrow(errorMessage);
  });
});
