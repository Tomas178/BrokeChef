import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import type { Database } from '@server/database';
import usersRouter from '..';

const mockTotalCreatedByUser = vi.fn();

const mockRecipesRepo: Partial<RecipesRepository> = {
  totalCreatedByUser: mockTotalCreatedByUser,
};

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepo,
}));

const createCaller = createCallerFactory(usersRouter);
const database = {} as Database;

const user = fakeUser();

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { totalCreated } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(totalCreated()).rejects.toThrow(/unauthenticated/i);
    expect(mockTotalCreatedByUser).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { totalCreated } = createCaller(authContext({ database }, user));

  it('Should return 0', async () => {
    mockTotalCreatedByUser.mockResolvedValueOnce(0);

    await expect(totalCreated()).resolves.toBe(0);
  });

  it('Should return the same number that was created', async () => {
    const totalRecipes = 5;
    mockTotalCreatedByUser.mockResolvedValueOnce(totalRecipes);

    await expect(totalCreated()).resolves.toBe(totalRecipes);
  });
});
