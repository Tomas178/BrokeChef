import { createAuthClient } from 'better-auth/vue';
import { apiOrigin } from '../config';
export const authClient = createAuthClient({
  baseURL: apiOrigin,
  fetchOptions: {
    credentials: 'include',
  },
});
