import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@server/shared/trpc';
import superjson from 'superjson';
import { apiOrigin, apiPath } from './config';
import { createAuthClient } from 'better-auth/vue';
import { fakeSignupUser } from './fakeData';

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

type UserSignup = Parameters<typeof authClient.signUp.email>[0];
type UserLogin = Parameters<typeof authClient.signIn.email>[0];
type UserLoginAuthed = UserLogin & { id: string; accessToken: string };

export async function loginNewUser(
  userSignup: UserSignup = fakeSignupUser()
): Promise<UserLoginAuthed> {
  try {
    await authClient.signUp.email(userSignup);
  } catch (error) {
    throw error;
  }

  const userLogin: UserLogin = {
    email: userSignup.email,
    password: userSignup.password,
  };

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
