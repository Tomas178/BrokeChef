import type { RecipesService } from '@server/services/recipesService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import {
  initialPage,
  type PaginationWithUserInput,
} from '@server/entities/shared';
import { fakeRecipe } from '@server/entities/tests/fakes';
import recipesRouter from '..';

const mockSearch = vi.fn();

const mockRecipesService: Partial<RecipesService> = {
  search: mockSearch,
};

vi.mock('@server/services/recipesService', () => ({
  recipesService: () => mockRecipesService,
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
