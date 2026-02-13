import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import type { UsersService } from '@server/services/usersService';
import type { Database } from '@server/database';
import usersRouter from '..';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';
const mockUpdateImage = vi.fn();

const mockUsersService: Partial<UsersService> = {
  updateImage: mockUpdateImage,
};

vi.mock('@server/services/usersService', () => ({
  usersService: () => mockUsersService,
}));

const createCaller = createCallerFactory(usersRouter);
const database = {} as Database;

const user = fakeUser();

const imageUrl = 'image-url';

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { updateImage } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(updateImage({ imageUrl })).rejects.toThrow(/unauthenticated/i);
    expect(mockUpdateImage).not.toHaveBeenCalled();
  });
});

describe('Authentcated tests', () => {
  const { updateImage } = createCaller(authContext({ database }, user));

  it('Should return a signed image url if updated successfully', async () => {
    mockUpdateImage.mockResolvedValueOnce(fakeImageUrl);

    await expect(updateImage({ imageUrl })).resolves.toBe(fakeImageUrl);
  });

  it('Should throw an error if user is not found', async () => {
    mockUpdateImage.mockRejectedValueOnce(new UserNotFound());

    const { updateImage } = createCaller(
      authContext(
        { database },
        { ...user, id: user.id.replaceAll(/[a-z]/gi, 'a') }
      )
    );

    await expect(updateImage({ imageUrl })).rejects.toThrow(/not found/i);
  });

  it('Should throw a general server error', async () => {
    mockUpdateImage.mockRejectedValueOnce(new Error('Service Failed'));

    await expect(updateImage({ imageUrl })).rejects.toThrow(/unexpected/i);
    expect(mockUpdateImage).toHaveBeenCalledWith(expect.any(String), imageUrl);
  });
});
