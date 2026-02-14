import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import type { Database } from '@server/database';
import usersRouter from '..';

const mockTotalSavedByUser = vi.fn();

const mockRecipesRepo: Partial<RecipesRepository> = {
  totalSavedByUser: mockTotalSavedByUser,
};

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepo,
}));

const createCaller = createCallerFactory(usersRouter);
const database = {} as Database;

const user = fakeUser();

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { totalSaved } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(totalSaved()).rejects.toThrow(/unauthenticated/i);
    expect(mockTotalSavedByUser).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { totalSaved } = createCaller(authContext({ database }, user));

  it('Should call totalSaved with userId from cookies return user when not given userId but authenticanted', async () => {
    const totalRecipes = 5;
    mockTotalSavedByUser.mockResolvedValueOnce(totalRecipes);

    const totalCount = await totalSaved();

    expect(mockTotalSavedByUser).toHaveBeenCalledExactlyOnceWith(user.id);
    expect(totalCount).toEqual(totalRecipes);
  });

  it('Should return 0', async () => {
    mockTotalSavedByUser.mockResolvedValueOnce(0);

    await expect(totalSaved({ userId: user.id })).resolves.toBe(0);
  });

  it('Should return the same number that was created', async () => {
    const totalRecipes = 5;
    mockTotalSavedByUser.mockResolvedValueOnce(totalRecipes);

    await expect(totalSaved({ userId: user.id })).resolves.toBe(totalRecipes);
  });
});
