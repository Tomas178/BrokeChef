import type { UsersRepository } from '@server/repositories/usersRepository';
import { assertError } from '@server/utils/errors';
import UserNotFound from '@server/utils/errors/users/UserNotFound';

export async function validateUserExists(
  usersRepository: UsersRepository,
  userId: string
) {
  try {
    const user = await usersRepository.findById(userId);

    return user;
  } catch (error) {
    if (error instanceof UserNotFound) {
      throw error;
    }

    assertError(error);
    throw new Error(`Failed to validate user existence: ${error.message}`);
  }
}
