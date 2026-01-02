import { createCallerFactory } from '@server/trpc';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import type { Database } from '@server/database';
import recipesRouter from '..';

const mockTotalCount = vi.fn();

const mockRecipesRepo: Partial<RecipesRepository> = {
  totalCount: mockTotalCount,
};

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepo,
}));

const createCaller = createCallerFactory(recipesRouter);
const database = {} as Database;

const { totalCount } = createCaller({ database });

beforeEach(() => vi.resetAllMocks());

it('Should return zero when there are no records in database', async () => {
  mockTotalCount.mockResolvedValueOnce(0);

  await expect(totalCount()).resolves.toBe(0);
});

it('Should return correct answer when there are records in database', async () => {
  const recipesLength = 3;
  mockTotalCount.mockResolvedValueOnce(recipesLength);

  await expect(totalCount()).resolves.toBe(recipesLength);
});
