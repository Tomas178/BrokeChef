import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { authContext, requestContext } from '@tests/utils/context';
import { insertAll } from '@tests/utils/record';
import { fakeCreateRecipeData, fakeUser } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { joinStepsToSingleString } from '@server/services/utils/joinStepsToSingleString';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

it('Should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ db: database }));

  await expect(create(fakeCreateRecipeData())).rejects.toThrow(
    /unauthenticated/i
  );
});

it('Should create a persisted recipe', async () => {
  const { create } = createCaller(authContext({ db: database }, user));

  const createRecipeData = fakeCreateRecipeData();

  const stepsInASingleString = joinStepsToSingleString(createRecipeData.steps);

  const recipeCreated = await create(createRecipeData);

  expect(recipeCreated).toMatchObject({
    ...pick(createRecipeData, recipesKeysPublic),
    steps: stepsInASingleString,
  });
});

it('Should throw an error on failure to create recipe', async () => {
  const { create } = createCaller(
    authContext(
      { db: database },
      { ...user, id: user.id.replaceAll(/[a-z]/gi, 'a') }
    )
  );

  await expect(create(fakeCreateRecipeData())).rejects.toThrow(
    /failed|recipe/i
  );
});
