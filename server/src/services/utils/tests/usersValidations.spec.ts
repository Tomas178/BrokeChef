import { fakeUser } from '@server/entities/tests/fakes';
import type { UsersPublic } from '@server/entities/users';
import type { UsersRepository } from '@server/repositories/usersRepository';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { validateUserExists } from '../userValidations';

const userId = 'a'.repeat(32);

const mockFindById = vi.fn(
  async (id): Promise<UsersPublic> =>
    fakeUser({
      id,
    })
);

const mockUsersRepository = {
  findById: mockFindById,
} as unknown as UsersRepository;

describe('validateUserExists', () => {
  it('Should return user when user exists', async () => {
    const user = await validateUserExists(mockUsersRepository, userId);

    expect(user.id).toBe(userId);
  });

  it('Should throw an error when user does not exist', async () => {
    mockFindById.mockRejectedValueOnce(new UserNotFound());

    await expect(
      validateUserExists(mockUsersRepository, userId)
    ).rejects.toThrow(/not found/i);
  });

  it('Should throw general failure message if any other error occurs', async () => {
    const errorMessage = 'Failed to create follow link';

    mockFindById.mockRejectedValueOnce(new Error(errorMessage));

    await expect(
      validateUserExists(mockUsersRepository, userId)
    ).rejects.toThrow(errorMessage);
  });
});
