import { createCallerFactory } from '@server/trpc';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { initialPage } from '@server/shared/pagination';
import { pick } from 'lodash-es';
import { usersKeysPublicWithoutId } from '@server/entities/users';
import { recipesKeysPublic } from '@server/entities/recipes';
import { authContext, requestContext } from '@tests/utils/context';
import usersRouter from '..';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => fakeImageUrl),
}));

const createCaller = createCallerFactory(usersRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

const { getRecipes } = createCaller(authContext({ db: database }, user));

const [createdRecipeOne, createdRecipeTwo] = await insertAll(
  database,
  'recipes',
  [fakeRecipe({ userId: user.id }), fakeRecipe({ userId: user.id })]
);

it('Should throw an error if user is not authenticated', async () => {
  const { getRecipes } = createCaller(requestContext({ db: database }));

  await expect(getRecipes({})).rejects.toThrow(/unauthenticated/i);
});

it('Should return saved and created recipes when given id', async () => {
  await insertAll(database, 'savedRecipes', [
    fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeOne.id }),
    fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeTwo.id }),
  ]);

  const { saved, created } = await getRecipes({
    userId: user.id,
    ...initialPage,
  });

  const [createdNew, createdOld] = created;
  const [savedNew, savedOld] = saved;

  // Check created recipes ordered descendingly by id
  expect(createdOld).toEqual({
    ...pick(createdRecipeOne, recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });

  expect(createdNew).toEqual({
    ...pick(createdRecipeTwo, recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });

  // Check saved recipes ordered descendingly by id
  expect(savedOld).toEqual({
    ...pick(createdRecipeOne, recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });

  expect(savedNew).toEqual({
    ...pick(createdRecipeTwo, recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });
});

it('Should return saved and created recipes when authenticated but not given id', async () => {
  await insertAll(database, 'savedRecipes', [
    fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeOne.id }),
    fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeTwo.id }),
  ]);

  const { saved, created } = await getRecipes({
    ...initialPage,
  });

  const [createdNew, createdOld] = created;
  const [savedNew, savedOld] = saved;

  // Check created recipes ordered descendingly by id
  expect(createdOld).toEqual({
    ...pick(createdRecipeOne, recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });

  expect(createdNew).toEqual({
    ...pick(createdRecipeTwo, recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });

  // Check saved recipes ordered descendingly by id
  expect(savedOld).toEqual({
    ...pick(createdRecipeOne, recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });

  expect(savedNew).toEqual({
    ...pick(createdRecipeTwo, recipesKeysPublic),
    author: pick(user, usersKeysPublicWithoutId),
    imageUrl: fakeImageUrl,
  });
});
