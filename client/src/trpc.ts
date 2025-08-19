import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@server/shared/trpc';
import superjson from 'superjson';
import { apiBase } from './config';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: apiBase,
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
