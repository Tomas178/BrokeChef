import type { RecipesService } from '@server/services/recipesService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import { initialPage } from '@server/entities/shared';
import recipesRouter from '..';

const mockFindAllRecommended = vi.fn();

const mockRecipesService: Partial<RecipesService> = {
  findAllRecommended: mockFindAllRecommended,
};

vi.mock('@server/services/recipesService', () => ({
  recipesService: () => mockRecipesService,
}));

const createCaller = createCallerFactory(recipesRouter);
const database = {} as Database;

const user = fakeUser();

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { findAllRecommended } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(findAllRecommended(initialPage)).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { findAllRecommended } = createCaller(authContext({ database }, user));

  it('Should return empty list if there are no recipes', async () => {
    mockFindAllRecommended.mockResolvedValueOnce([]);

    await expect(findAllRecommended(initialPage)).resolves.toEqual([]);
  });

  it('Should return recipes', async () => {
    const recipes = [fakeRecipe(), fakeRecipe()];
    mockFindAllRecommended.mockResolvedValueOnce(recipes);

    await expect(findAllRecommended(initialPage)).resolves.toBe(recipes);
  });
});
