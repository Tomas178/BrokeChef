import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@server/shared/trpc';
import superjson from 'superjson';
import { apiOrigin, apiPath } from './config';
import { createAuthClient } from 'better-auth/vue';
import { fakeUser } from './fakeData';
import { Page } from '@playwright/test';

let accessToken: string | null = null;

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${apiOrigin}${apiPath}`,
      transformer: superjson,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});

export const authClient = createAuthClient({
  baseURL: apiOrigin,
  fetchOptions: {
    credentials: 'include',
  },
});

type UserLogin = Parameters<typeof authClient.signIn.email>[0];
type UserLoginAuthed = UserLogin & { id: string; accessToken: string };

export async function loginNewUser(
  userLogin: UserLogin = fakeUser()
): Promise<UserLoginAuthed> {
  try {
    await authClient.signIn.email(userLogin);
  } catch (error) {
    throw error;
  }

  const { data: loginResponse } = await authClient.signIn.email(userLogin);

  if (!loginResponse) {
    throw new Error('Login failed: no response from authClient');
  }

  const userId = loginResponse.user.id;

  return {
    ...userLogin,
    id: userId,
    accessToken: loginResponse.token,
  };
}

export async function asUser<T>(
  page: Page,
  userLogin: UserLogin,
  callback: (user: UserLoginAuthed) => Promise<T>
): Promise<T> {
  const [user] = await Promise.all([
    loginNewUser(userLogin),
    (async () => {
      if (page.url() === 'about:blank') {
        await page.goto('/');
        await page.waitForURL('/');
      }
    })(),
  ]);

  accessToken = user.accessToken;
  await page.evaluate(
    ({ accessToken }) => {
      localStorage.setItem('authToken', accessToken);
    },
    { accessToken }
  );

  const callbackResult = await callback(user);

  await page.evaluate(() => {
    localStorage.removeItem('authToken');
  });
  accessToken = null;

  return callbackResult;
}
