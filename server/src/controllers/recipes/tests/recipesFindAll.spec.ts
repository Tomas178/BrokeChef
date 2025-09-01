import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { clearTables, insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import recipesRouter from '..';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => fakeImageUrl),
}));

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

await clearTables(database, ['recipes']);
const [user] = await insertAll(database, 'users', fakeUser());

const { findAll } = createCaller({ db: database });

it('Should return an empty list if there are no recipes', async () => {
  const { recipes, hasMore } = await findAll({});

  expect(recipes).toHaveLength(0);
  expect(hasMore).toBeFalsy();
});

it('Should return a list of recipes', async () => {
  await insertAll(database, 'recipes', fakeRecipe({ userId: user.id }));

  const { recipes, hasMore } = await findAll({});

  expect(recipes).toHaveLength(1);
  expect(hasMore).toBeFalsy();
});

it('Should return the latest recipe first', async () => {
  const [recipeOld] = await insertAll(
    database,
    'recipes',
    fakeRecipe({ userId: user.id })
  );

  const [recipeNew] = await insertAll(
    database,
    'recipes',
    fakeRecipe({ userId: user.id })
  );

  const { recipes, hasMore } = await findAll({});

  expect(recipes[0]).toMatchObject({
    ...recipeNew,
    imageUrl: fakeImageUrl,
  });
  expect(recipes[1]).toMatchObject({
    ...recipeOld,
    imageUrl: fakeImageUrl,
  });

  expect(hasMore).toBeFalsy();
});

it('Should return the latest reipes and hasMore to be true', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_recipeOne, recipeTwo, recipeThree] = await insertAll(
    database,
    'recipes',
    [
      fakeRecipe({ userId: user.id }),
      fakeRecipe({ userId: user.id }),
      fakeRecipe({ userId: user.id }),
    ]
  );

  const { recipes, hasMore } = await findAll({ offset: 0, limit: 2 });

  expect(recipes[0]).toMatchObject({
    ...recipeThree,
    imageUrl: fakeImageUrl,
  });

  expect(recipes[1]).toMatchObject({
    ...recipeTwo,
    imageUrl: fakeImageUrl,
  });

  expect(hasMore).toBeTruthy();
});
