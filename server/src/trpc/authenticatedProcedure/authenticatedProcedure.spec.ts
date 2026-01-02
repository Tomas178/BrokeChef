vi.mock('@server/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const { auth } = await import('@server/auth');
import { authContext, requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import { createCallerFactory, router } from '..';
import { authenticatedProcedure } from '.';

const successLog = 'passed';

const routes = router({
  testCall: authenticatedProcedure.query(() => successLog),
});

const createCaller = createCallerFactory(routes);

const database = {} as Database;

const authenticated = createCaller(authContext({ database }));

const VALID_TOKEN = 'valid-token';

it('Should pass if user is already authenticated', async () => {
  const response = await authenticated.testCall();

  expect(response).toEqual(successLog);
});

it('Should pass if user is logged in but not yet authenticated', async () => {
  (auth.api.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: { id: 'user-id-123' },
  });

  const usingValidLogin = createCaller({
    database,
    req: {
      headers: {
        authorization: `Bearer ${VALID_TOKEN}`,
      },
    } as any,
  });

  const response = await usingValidLogin.testCall();

  expect(response).toEqual(successLog);
});

it('Should throw an error if user is not logged in', async () => {
  (auth.api.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(
    undefined
  );

  const unauthenticated = createCaller(requestContext({ database }));

  await expect(unauthenticated.testCall()).rejects.toThrow(
    /login|log in|logged in|authenticate|unauthorized/i
  );
});

it('Should throw an error if it is run without access to headers', async () => {
  const invalidHeaders = createCaller({
    database,
    req: undefined as any,
  });

  await expect(invalidHeaders.testCall()).rejects.toThrow(/express/i);
});
