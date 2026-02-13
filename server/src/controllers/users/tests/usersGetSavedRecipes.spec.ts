import { createCallerFactory } from '@server/trpc';
import {
  fakeRecipeAllInfoWithoutToolsAndIngredientsAndEmail,
  fakeUser,
} from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { UsersService } from '@server/services/usersService';
import type { Database } from '@server/database';
import usersRouter from '..';

const mockGetSavedRecipes = vi.fn();

const mockUsersService: Partial<UsersService> = {
  getSavedRecipes: mockGetSavedRecipes,
};

vi.mock('@server/services/usersService', () => ({
  usersService: () => mockUsersService,
}));

const createCaller = createCallerFactory(usersRouter);
const database = {} as Database;

const user = fakeUser();

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { getSavedRecipes } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(getSavedRecipes({})).rejects.toThrow(/unauthenticated/i);
    expect(mockGetSavedRecipes).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { getSavedRecipes } = createCaller(authContext({ database }, user));

  it('Should return empty array if user has no created recipes', async () => {
    mockGetSavedRecipes.mockResolvedValueOnce([]);

    await expect(getSavedRecipes({})).resolves.toEqual([]);
  });

  it('Should return saved recipes', async () => {
    const createdRecipes = [
      fakeRecipeAllInfoWithoutToolsAndIngredientsAndEmail(),
      fakeRecipeAllInfoWithoutToolsAndIngredientsAndEmail(),
    ];
    mockGetSavedRecipes.mockResolvedValueOnce(createdRecipes);

    const retrievedCreatedRecipes = await getSavedRecipes({});

    expect(retrievedCreatedRecipes).toHaveLength(createdRecipes.length);
    expect(retrievedCreatedRecipes).toStrictEqual(createdRecipes);
  });
});
