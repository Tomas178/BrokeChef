vi.mock('@server/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const { auth } = await import('@server/auth');
import { authContext, requestContext } from '@tests/utils/context';
import { createCallerFactory, router } from '..';
import { authenticatedProcedure } from '.';

const successLog = 'passed';

const routes = router({
  testCall: authenticatedProcedure.query(() => successLog),
});

const createCaller = createCallerFactory(routes);

const database = {} as any;

const authenticated = createCaller(authContext({ db: database }));

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
    db: database,
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

  const unauthenticated = createCaller(requestContext({ db: database }));

  await expect(unauthenticated.testCall()).rejects.toThrow(
    /login|log in|logged in|authenticate|unauthorized/i
  );
});

it('Should throw an error if it is run without access to headers', async () => {
  const invalidHeaders = createCaller({
    db: database,
    req: undefined as any,
  });

  await expect(invalidHeaders.testCall()).rejects.toThrow(/express/i);
});
