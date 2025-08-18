import { frontendBase } from '@/config';
import { authClient } from '@/lib/auth-client';
import { computed } from 'vue';

export const isLoggedIn = computed(() => !!authClient.getSession());

export async function signup(credentials: {
  username: string;
  email: string;
  password: string;
}) {
  const { username, email, password } = credentials;

  const { error } = await authClient.signUp.email({
    name: username,
    email,
    password,
    callbackURL: frontendBase,
    fetchOptions: {
      onSuccess: () => console.log(`Email verification sent to ${email}`),
      onError: (ctx) => console.log(ctx.error.message),
    },
  });

  if (error) throw new Error(error.message);
}
