import { frontendBase, resetPasswordBase } from '@/config';
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

export async function login(credentials: { email: string; password: string }) {
  const { email, password } = credentials;

  const { error } = await authClient.signIn.email({
    email,
    password,
    callbackURL: frontendBase,
    fetchOptions: {
      onSuccess: () => console.log(`${email} logged in!`),
      onError: (ctx) => console.log(ctx.error.message),
    },
  });

  if (error) throw new Error(error.message);
}

export async function socialLogin(providerName: string) {
  authClient.signIn.social({
    provider: providerName,
    callbackURL: frontendBase,
  });
}

export async function sendResetPasswordLink(email: string) {
  await authClient.requestPasswordReset({
    email,
    redirectTo: resetPasswordBase,
    fetchOptions: {
      onSuccess: () => console.log(`Reset password link is sent to: ${email}`),
      onError: (ctx) => console.log(ctx.error.message),
    },
  });
}

export async function resetPassword(newPassword: string) {
  const token = new URLSearchParams(window.location.search).get('token');

  if (!token) {
    throw new Error(
      'No token found. Please go again to this page via email or request for another link'
    );
  }

  const { error } = await authClient.resetPassword({
    newPassword,
    token,
    fetchOptions: {
      onSuccess: () => console.log('Password is resetted'),
      onError: (ctx) => console.log(ctx.error.message),
    },
  });

  if (error) throw new Error(error.message);
}
