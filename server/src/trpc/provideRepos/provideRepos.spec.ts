import { z } from 'zod';
import { createCallerFactory, publicProcedure, router } from '..';
import provideRepos from '.';

const database = {} as any;
const recipesRepositoryBuilder = vi.fn(() => {
  // Intentionally left blank for mocking
}) as any;

const routes = router({
  testCall: publicProcedure
    .use(provideRepos({ recipesRepository: recipesRepositoryBuilder }))
    .input(z.object({}))
    .query(() => 'ok'),
});

afterEach(() => {
  vi.resetAllMocks();
});

it('provides repos', async () => {
  const context = {
    database,
  };

  const caller = createCallerFactory(routes);
  const { testCall } = caller(context as any);

  expect(await testCall({})).toEqual('ok');
  expect(recipesRepositoryBuilder).toHaveBeenCalledWith(database);
});

it('skips providing repos if they are already in context', async () => {
  const context = {
    database,
    repos: {
      recipesRepository: {},
    },
  };

  const caller = createCallerFactory(routes);
  const { testCall } = caller(context as any);

  expect(await testCall({})).toEqual('ok');
  expect(recipesRepositoryBuilder).not.toHaveBeenCalled();
});
