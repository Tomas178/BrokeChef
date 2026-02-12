import { createCallerFactory } from '@server/trpc';
import { authContext, requestContext } from '@tests/utils/context';
import { fakeUser } from '@server/entities/tests/fakes';
import type { Database } from '@server/database';
import type { SavedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import savedRecipesRouter from '..';

const mockIsSaved = vi.fn();

const mockSavedRecipesRepository: Partial<SavedRecipesRepository> = {
  isSaved: mockIsSaved,
};

vi.mock('@server/repositories/savedRecipesRepository', () => ({
  savedRecipesRepository: () => mockSavedRecipesRepository,
}));

const createCaller = createCallerFactory(savedRecipesRouter);
const database = {} as Database;

const user = fakeUser();

const recipeId = 123;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { isSaved } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(isSaved({ id: recipeId })).rejects.toThrow(/unauthenticated/i);
    expect(mockIsSaved).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { isSaved } = createCaller(authContext({ database }, user));

  it('Should return false if user has not saved the recipe', async () => {
    mockIsSaved.mockResolvedValueOnce(false);

    await expect(isSaved({ id: recipeId })).resolves.toBeFalsy();
    expect(mockIsSaved).toHaveBeenCalledOnce();
  });

  it('Should return true if user has saved the recipe', async () => {
    mockIsSaved.mockResolvedValueOnce(true);

    await expect(isSaved({ id: recipeId })).resolves.toBeTruthy();
    expect(mockIsSaved).toHaveBeenCalledOnce();
  });
});
