import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import usersRouter from '..';

const { mockUpdateImage, mockSignImages } = vi.hoisted(() => ({
  mockUpdateImage: vi.fn(),
  mockSignImages: vi.fn(),
}));

vi.mock('@server/services/usersService', async () => {
  const actual: any = await vi.importActual('@server/services/usersService');

  return {
    ...actual,
    usersService: (database_: any) => ({
      ...actual.usersService(database_),
      updateImage: mockUpdateImage,
    }),
  };
});

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@server/utils/signImages', () => ({
  signImages: mockSignImages,
}));

const createCaller = createCallerFactory(usersRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

const { updateImage } = createCaller(authContext({ database }, user));

it('Should return a signed image url if updated successfully', async () => {
  mockUpdateImage.mockResolvedValueOnce(fakeImageUrl);

  await expect(updateImage('image')).resolves.toBe(fakeImageUrl);
});

it('Should throw an error if user is not authenticated', async () => {
  const { updateImage } = createCaller(requestContext({ database }));

  await expect(updateImage('image')).rejects.toThrow(/unauthenticated/i);
});

it('Should throw an error if user is not found', async () => {
  mockUpdateImage.mockRejectedValueOnce(new UserNotFound());

  const { updateImage } = createCaller(
    authContext(
      { database },
      { ...user, id: user.id.replaceAll(/[a-z]/gi, 'a') }
    )
  );

  await expect(updateImage('image')).rejects.toThrow(/not found/i);
});

it('Should throw a general server error', async () => {
  mockUpdateImage.mockRejectedValueOnce(new Error('Service Failed'));

  await expect(updateImage('image')).rejects.toThrow(/failed/i);
  expect(mockUpdateImage).toHaveBeenCalledWith(expect.any(String), 'image');
});
