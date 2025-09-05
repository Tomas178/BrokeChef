import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublicWithoutId } from '@server/entities/users';
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

const { getCreatedRecipes } = createCaller(authContext({ db: database }, user));

it('Should throw an error if user is not authenticated', async () => {
  const { getCreatedRecipes } = createCaller(requestContext({ db: database }));

  await expect(getCreatedRecipes({})).rejects.toThrow(/unauthenticated/i);
});

it('Should return empty array if user has no created recipes', async () => {
  await expect(getCreatedRecipes({})).resolves.toEqual([]);
});

it('Should return created recipes', async () => {
  const createdRecipes = await insertAll(database, 'recipes', [
    fakeRecipe({ userId: user.id }),
    fakeRecipe({ userId: user.id }),
  ]);

  const retrievedCreatedRecipes = await getCreatedRecipes({});

  expect(retrievedCreatedRecipes).toHaveLength(createdRecipes.length);

  const [createdNew, createdOld] = retrievedCreatedRecipes;

  expect(createdOld).toEqual({
    ...pick(createdRecipes[0], recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });

  expect(createdNew).toEqual({
    ...pick(createdRecipes[1], recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });
});
