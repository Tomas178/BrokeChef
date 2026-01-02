import { createCallerFactory } from '@server/trpc';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { initialPage } from '@server/entities/shared';
import { authContext, requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import type { UsersService } from '@server/services/usersService';
import usersRouter from '..';

const mockGetRecipes = vi.fn();

const mockUsersService: Partial<UsersService> = {
  getRecipes: mockGetRecipes,
};

vi.mock('@server/services/usersService', () => ({
  usersService: () => mockUsersService,
}));

const createCaller = createCallerFactory(usersRouter);
const database = {} as Database;

const user = fakeUser();

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { getRecipes } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(getRecipes({})).rejects.toThrow(/unauthenticated/i);
    expect(mockGetRecipes).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { getRecipes } = createCaller(authContext({ database }, user));

  it('Should return saved and created recipes when given id', async () => {
    const savedRecipes = [fakeSavedRecipe(), fakeSavedRecipe()];
    const createdRecipes = [fakeRecipe(), fakeRecipe()];

    const userRecipes = {
      saved: savedRecipes,
      created: createdRecipes,
    };
    mockGetRecipes.mockResolvedValueOnce(userRecipes);

    const { saved, created } = await getRecipes({
      userId: user.id,
      ...initialPage,
    });

    expect(saved).toBe(savedRecipes);
    expect(created).toBe(createdRecipes);
  });

  it('Should return saved and created recipes when authenticated but not given id', async () => {
    const savedRecipes = [fakeSavedRecipe(), fakeSavedRecipe()];
    const createdRecipes = [fakeRecipe(), fakeRecipe()];

    const userRecipes = {
      saved: savedRecipes,
      created: createdRecipes,
    };
    mockGetRecipes.mockResolvedValueOnce(userRecipes);

    const { saved, created } = await getRecipes({
      ...initialPage,
    });

    expect(saved).toBe(savedRecipes);
    expect(created).toBe(createdRecipes);
  });
});
