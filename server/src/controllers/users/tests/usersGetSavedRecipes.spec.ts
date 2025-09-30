import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { createCallerFactory } from '@server/trpc';
import { authContext, requestContext } from '@tests/utils/context';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { wrapInRollbacks } from '@tests/utils/transactions';
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

const [userCreator, userSaver] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const saverId = userSaver.id;

const [recipeOne, recipeTwo] = await insertAll(database, 'recipes', [
  fakeRecipe({ userId: userCreator.id }),
  fakeRecipe({ userId: userCreator.id }),
]);

const { getSavedRecipes } = createCaller(
  authContext({ db: database }, userSaver)
);

it('Should throw an error if user is not authenticated', async () => {
  const { getSavedRecipes } = createCaller(requestContext({ db: database }));

  await expect(getSavedRecipes({})).rejects.toThrow(/unauthenticated/i);
});

it('Should return empty array if user has no saved recipes', async () => {
  await expect(getSavedRecipes({})).resolves.toEqual([]);
});

it('Should return saved recipes', async () => {
  const savedRecipes = await insertAll(database, 'savedRecipes', [
    fakeSavedRecipe({ userId: saverId, recipeId: recipeOne.id }),
    fakeSavedRecipe({ userId: saverId, recipeId: recipeTwo.id }),
  ]);

  const retrievedSavedRecipes = await getSavedRecipes({ userId: saverId });

  expect(retrievedSavedRecipes).toHaveLength(savedRecipes.length);

  const [savedNew, savedOld] = retrievedSavedRecipes;

  expect(savedOld).toEqual({
    ...pick(recipeOne, recipesKeysPublic),
    author: pick(userCreator, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
    rating: null,
  });

  expect(savedNew).toEqual({
    ...pick(recipeTwo, recipesKeysPublic),
    author: pick(userCreator, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
    rating: null,
  });
});
