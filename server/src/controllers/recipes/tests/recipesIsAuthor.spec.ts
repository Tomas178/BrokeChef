import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import recipesRouter from '..';

const mockIsAuthor = vi.fn();

const mockRecipesRepo: Partial<RecipesRepository> = {
  isAuthor: mockIsAuthor,
};

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepo,
}));

const createCaller = createCallerFactory(recipesRouter);
const database = {} as Database;

const user = fakeUser();
const recipeId = 123;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { isAuthor } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(isAuthor(recipeId)).rejects.toThrow(/unauthenticated/i);
    expect(mockIsAuthor).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { isAuthor } = createCaller(authContext({ database }, user));

  it('Should return false if user is not an author', async () => {
    mockIsAuthor.mockResolvedValueOnce(false);

    await expect(isAuthor(recipeId)).resolves.toBeFalsy();
  });

  it('Should return true if user is an author', async () => {
    mockIsAuthor.mockResolvedValueOnce(true);

    await expect(isAuthor(recipeId)).resolves.toBeTruthy();
  });
});
