import { fakeUser } from '@server/entities/tests/fakes';
import type { UsersRepository } from '@server/repositories/usersRepository';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { validateUserExists } from '../userValidations';

const user = fakeUser();

const mockFindById = vi.fn();

const mockUsersRepository = {
  findById: mockFindById,
} as unknown as UsersRepository;

describe('validateUserExists', () => {
  it('Should return user when user exists', async () => {
    mockFindById.mockResolvedValueOnce(user);
    const userFromRepo = await validateUserExists(mockUsersRepository, user.id);

    expect(userFromRepo).toBe(user);
  });

  it('Should throw an error when user does not exist', async () => {
    mockFindById.mockRejectedValueOnce(new UserNotFound());

    await expect(
      validateUserExists(mockUsersRepository, user.id)
    ).rejects.toThrow(/not found/i);
  });

  it('Should throw general failure message if any other error occurs', async () => {
    const errorMessage = 'Failed to create follow link';

    mockFindById.mockRejectedValueOnce(new Error(errorMessage));

    await expect(
      validateUserExists(mockUsersRepository, user.id)
    ).rejects.toThrow(errorMessage);
  });
});
