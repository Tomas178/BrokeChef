import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import type { UsersService } from '@server/services/usersService';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import usersRouter from '..';

const mockFindById = vi.fn();

const mockUsersService = {
  findById: mockFindById,
} as Partial<UsersService>;

vi.mock('@server/services/usersService', () => ({
  usersService: () => mockUsersService,
}));

const createCaller = createCallerFactory(usersRouter);
const database = {} as Database;

const user = fakeUser();

beforeEach(() => mockFindById.mockReset());

describe('Unauthenticated tests', () => {
  const { findById } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(findById()).rejects.toThrow(/unauthenticated/i);
  });
});

describe('Authenticated tests', () => {
  const { findById } = createCaller(authContext({ database }, user));

  it('Should throw an error if user is not found', async () => {
    mockFindById.mockRejectedValueOnce(new UserNotFound());

    await expect(findById(user.id)).rejects.toThrow(/not found/i);
    expect(mockFindById).toHaveBeenCalledExactlyOnceWith(user.id);
  });

  it('Should rethrow any other error', async () => {
    mockFindById.mockRejectedValueOnce(new Error('Network error'));

    await expect(findById(user.id)).rejects.toThrow(/unexpected/i);
  });

  it('Should call findById with userId from cookies return user when not given userId but authenticanted', async () => {
    mockFindById.mockResolvedValueOnce(user);

    const userByAuth = await findById();

    expect(mockFindById).toHaveBeenCalledExactlyOnceWith(user.id);
    expect(userByAuth).toEqual(user);
  });

  it('Should call findById with given userId return user when given userId', async () => {
    mockFindById.mockResolvedValueOnce(user);

    const randomUserId = 'a'.repeat(32);
    const userById = await findById(randomUserId);

    expect(mockFindById).toHaveBeenCalledExactlyOnceWith(randomUserId);
    expect(userById).toEqual(user);
  });
});
