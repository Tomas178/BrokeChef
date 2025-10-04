import * as z from 'zod';
import { createCallerFactory, publicProcedure, router } from '..';
import provideServices from '.';

const database = {} as any;
const recipesServiceBuilder = vi.fn(() => {
  // Intentionally left blank for mocking
}) as any;

const routes = router({
  testCall: publicProcedure
    .use(provideServices({ recipesService: recipesServiceBuilder }))
    .input(z.object({}))
    .query(() => 'ok'),
});

afterEach(() => {
  vi.resetAllMocks();
});

it('Provides services', async () => {
  const context = {
    database,
  };

  const caller = createCallerFactory(routes);
  const { testCall } = caller(context as any);

  expect(await testCall({})).toEqual('ok');
  expect(recipesServiceBuilder).toHaveBeenCalledWith(database);
});

it('Skips providing services if they are already in the context', async () => {
  const context = {
    database,
    services: {
      recipesService: {},
    },
  };

  const caller = createCallerFactory(routes);
  const { testCall } = caller(context as any);

  expect(await testCall({})).toEqual('ok');
  expect(recipesServiceBuilder).not.toHaveBeenCalled();
});
