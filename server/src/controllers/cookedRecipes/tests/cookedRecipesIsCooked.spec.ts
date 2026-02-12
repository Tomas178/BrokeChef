import { createCallerFactory } from '@server/trpc';
import { authContext, requestContext } from '@tests/utils/context';
import { fakeUser } from '@server/entities/tests/fakes';
import type { Database } from '@server/database';
import type { CookedRecipesRepository } from '@server/repositories/cookedRecipesRepository';
import cookedRecipesRouter from '..';

const mockIsCooked = vi.fn();

const mockCookedRecipesRepository: Partial<CookedRecipesRepository> = {
  isCooked: mockIsCooked,
};

vi.mock('@server/repositories/cookedRecipesRepository', () => ({
  cookedRecipesRepository: () => mockCookedRecipesRepository,
}));

const createCaller = createCallerFactory(cookedRecipesRouter);
const database = {} as Database;

const user = fakeUser();
const recipeId = 123;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { isMarked } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(isMarked({ id: recipeId })).rejects.toThrow(
      /unauthenticated/i
    );
    expect(mockIsCooked).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { isMarked } = createCaller(authContext({ database }, user));

  afterEach(() => expect(mockIsCooked).toHaveBeenCalledOnce());

  it('Should return false if user has not marked the recipe as already cooked', async () => {
    mockIsCooked.mockResolvedValueOnce(false);

    await expect(isMarked({ id: recipeId })).resolves.toBeFalsy();
  });

  it('Should return true if user has marked the recipe as already cooked', async () => {
    mockIsCooked.mockResolvedValueOnce(true);

    await expect(isMarked({ id: recipeId })).resolves.toBeTruthy();
  });
});
