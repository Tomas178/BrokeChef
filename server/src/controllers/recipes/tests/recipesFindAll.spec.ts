import { createCallerFactory } from '@server/trpc';
import { fakeRecipeAllInfoWithoutEmail } from '@server/entities/tests/fakes';
import type { RecipesService } from '@server/services/recipesService';
import type { Database } from '@server/database';
import recipesRouter from '..';

const mockFindAll = vi.fn();

const mockRecipesService: Partial<RecipesService> = {
  findAll: mockFindAll,
};

vi.mock('@server/services/recipesService', () => ({
  recipesService: () => mockRecipesService,
}));

const createCaller = createCallerFactory(recipesRouter);
const database = {} as Database;

const { findAll } = createCaller({ database });

beforeEach(() => vi.resetAllMocks());

it('Should return an empty list if there are no recipes', async () => {
  mockFindAll.mockResolvedValueOnce([]);
  const recipes = await findAll({});

  expect(recipes).toHaveLength(0);
});

it('Should return a list of recipes', async () => {
  const fakeRecipes = [
    fakeRecipeAllInfoWithoutEmail(),
    fakeRecipeAllInfoWithoutEmail(),
  ];
  mockFindAll.mockResolvedValueOnce(fakeRecipes);

  const recipes = await findAll({});

  expect(recipes).toHaveLength(fakeRecipes.length);
});
