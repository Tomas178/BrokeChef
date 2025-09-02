import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import usersRouter from '..';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@server/utils/signImages', () => ({
  signImages: vi.fn((images: string | string[]) => {
    if (Array.isArray(images)) {
      return images.map(() => fakeImageUrl);
    }
    return fakeImageUrl;
  }),
}));

const createCaller = createCallerFactory(usersRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

const { updateImage } = createCaller(authContext({ db: database }, user));

it('Should return a signed image url if updated successfully', async () => {
  await expect(updateImage('image')).resolves.toBe(fakeImageUrl);
});

it('Should throw an error if user is not authenticated', async () => {
  const { updateImage } = createCaller(requestContext({ db: database }));

  await expect(updateImage('image')).rejects.toThrow(/unauthenticated/i);
});

it('Should throw an error if user is not found', async () => {
  const { updateImage } = createCaller(
    authContext(
      { db: database },
      { ...user, id: user.id.replaceAll(/[a-z]/gi, 'a') }
    )
  );

  await expect(updateImage('image')).rejects.toThrow(/not found/i);
});
