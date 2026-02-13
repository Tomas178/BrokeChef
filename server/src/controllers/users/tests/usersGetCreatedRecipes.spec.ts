import { createCallerFactory } from '@server/trpc';
import {
  fakeRecipeAllInfoWithoutToolsAndIngredientsAndEmail,
  fakeUser,
} from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { UsersService } from '@server/services/usersService';
import type { Database } from '@server/database';
import usersRouter from '..';

const mockGetCreatedRecipes = vi.fn();

const mockUsersService: Partial<UsersService> = {
  getCreatedRecipes: mockGetCreatedRecipes,
};

vi.mock('@server/services/usersService', () => ({
  usersService: () => mockUsersService,
}));

const createCaller = createCallerFactory(usersRouter);
const database = {} as Database;

const user = fakeUser();

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { getCreatedRecipes } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(getCreatedRecipes({})).rejects.toThrow(/unauthenticated/i);
    expect(mockGetCreatedRecipes).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { getCreatedRecipes } = createCaller(authContext({ database }, user));

  it('Should return empty array if user has no created recipes', async () => {
    mockGetCreatedRecipes.mockResolvedValueOnce([]);

    await expect(getCreatedRecipes({})).resolves.toEqual([]);
  });

  it('Should return created recipes', async () => {
    const createdRecipes = [
      fakeRecipeAllInfoWithoutToolsAndIngredientsAndEmail(),
      fakeRecipeAllInfoWithoutToolsAndIngredientsAndEmail(),
    ];
    mockGetCreatedRecipes.mockResolvedValueOnce(createdRecipes);

    const retrievedCreatedRecipes = await getCreatedRecipes({});

    expect(retrievedCreatedRecipes).toHaveLength(createdRecipes.length);
    expect(retrievedCreatedRecipes).toStrictEqual(createdRecipes);
  });
});
