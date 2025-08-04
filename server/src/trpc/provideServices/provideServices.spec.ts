import z from 'zod';
import provideServices from '.';
import { createCallerFactory, publicProcedure, router } from '..';

const db = {} as any;
const recipesServiceBuilder = vi.fn(() => {}) as any;

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
  const ctx = {
    db,
  };

  const caller = createCallerFactory(routes);
  const { testCall } = caller(ctx as any);

  expect(await testCall({})).toEqual('ok');
  expect(recipesServiceBuilder).toHaveBeenCalledWith(db);
});

it('Skips providing services if they are already in the context', async () => {
  const ctx = {
    db,
    services: {
      recipesService: {},
    },
  };

  const caller = createCallerFactory(routes);
  const { testCall } = caller(ctx as any);

  expect(await testCall({})).toEqual('ok');
  expect(recipesServiceBuilder).not.toHaveBeenCalled();
});
