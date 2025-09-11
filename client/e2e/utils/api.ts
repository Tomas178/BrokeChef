import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@server/shared/trpc';
import superjson from 'superjson';
import { apiOrigin, apiPath } from './config';
import { createAuthClient } from 'better-auth/vue';

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

export type userSignup = Parameters<typeof authClient.signUp.email>[0];
export type UserLogin = Parameters<typeof authClient.signIn.email>[0];
