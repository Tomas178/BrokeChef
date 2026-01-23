import type { RecipesService } from '@server/services/recipesService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import {
  initialPage,
  type PaginationWithUserInput,
} from '@server/entities/shared';
import { fakeRecipe } from '@server/entities/tests/fakes';
import RateLimitError from '@server/utils/errors/general/RateLimitError';
import type { Request } from 'express';
import recipesRouter from '..';
import { NO_IP_ADDRESS } from '../search';

const mockSearch = vi.fn();

const mockRecipesService: Partial<RecipesService> = {
  search: mockSearch,
};

vi.mock('@server/services/recipesService', () => ({
  recipesService: () => mockRecipesService,
}));

const mockCheckRateLimit = vi.hoisted(() => vi.fn());
vi.mock('@server/utils/rateLimiter', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

const createCaller = createCallerFactory(recipesRouter);
const database = {} as Database;

const { search } = createCaller({ database });

const userInput = 'Something very delicious';

const paginationWithUserInput: PaginationWithUserInput = {
  userInput,
  ...initialPage,
};

beforeEach(() => vi.resetAllMocks());

it('Should use real IP value in the Request object', async () => {
  const ip = '127.0.0.1';
  const { search: searchWithIP } = createCaller({
    database,
    req: { ip } as Request,
  });

  await searchWithIP(paginationWithUserInput);

  expect(mockCheckRateLimit).toHaveBeenCalledExactlyOnceWith(
    ip,
    expect.anything()
  );
});

it('Should throw an error if rate limit was excedded and use NO_IP_ADDRESS value', async () => {
  const errorMessage = 'errorMessage';
  mockCheckRateLimit.mockRejectedValueOnce(new RateLimitError(errorMessage));

  await expect(search(paginationWithUserInput)).rejects.toThrow(errorMessage);

  expect(mockCheckRateLimit).toHaveBeenCalledExactlyOnceWith(
    NO_IP_ADDRESS,
    expect.anything()
  );
  expect(mockSearch).not.toHaveBeenCalled();
});

it('Should rethrow any other error when checking rate limit', async () => {
  const errorMessage = 'errorMessage';
  mockCheckRateLimit.mockRejectedValueOnce(new Error(errorMessage));

  await expect(search(paginationWithUserInput)).rejects.toThrow(errorMessage);
  expect(mockSearch).not.toHaveBeenCalled();
});

it('Should return an empty list if there are no recipes', async () => {
  mockSearch.mockResolvedValueOnce([]);
  const recipes = await search(paginationWithUserInput);

  expect(recipes).toHaveLength(0);
});

it('Should return a list of recipes', async () => {
  const fakeRecipes = [fakeRecipe(), fakeRecipe()];
  mockSearch.mockResolvedValueOnce(fakeRecipes);

  const recipes = await search(paginationWithUserInput);

  expect(recipes).toHaveLength(fakeRecipes.length);
});
