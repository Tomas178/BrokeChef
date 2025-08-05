import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { authContext, requestContext } from '@tests/utils/context';
import { insertAll } from '@tests/utils/record';
import { fakeUser } from '@server/entities/tests/fakes';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

it('Should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ db: database }));

  await expect(
    create({
      ingredients: ['tomato', 'cucumber', 'lettuce'],
      tools: ['spoon', 'whisk', 'plate'],
      title: 'My special Recipe',
      duration: '60 seconds',
      steps: ['Open the fridge', 'Take the products', 'make food'],
    })
  ).rejects.toThrow(/unauthenticated/i);
});

it('Should create a persisted recipe', async () => {
  const [user] = await insertAll(database, 'users', [fakeUser()]);
  const { create } = createCaller(authContext({ db: database }, user));

  const recipeReturned = await create({
    ingredients: ['tomato', 'cucumber', 'lettuce'],
    tools: ['spoon', 'whisk', 'plate'],
    title: 'My special Recipe',
    duration: '60 seconds',
    steps: ['Open the fridge', 'Take the products', 'make food'],
  });

  expect(recipeReturned).toMatchObject({
    id: expect.any(Number),
    title: 'My special Recipe',
    duration: '60 seconds',
    userId: user.id,
    steps: 'Open the fridge\nTake the products\nmake food',
  });
});
