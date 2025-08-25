import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authClient } from '@/lib/auth-client';
import { frontendBase, resetPasswordBase } from '@/config';

export const useUserStore = defineStore('user', () => {
  const authToken = ref<string | null>(localStorage.getItem('authToken'));

  const isLoggedIn = computed(() => !!authToken.value);

  function setToken(token: string | null) {
    authToken.value = token;
    if (token) localStorage.setItem('authToken', token);
    else localStorage.removeItem('authToken');
  }

  async function signup(credentials: {
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

  async function login(credentials: { email: string; password: string }) {
    const { email, password } = credentials;

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: () => console.log(`${email} logged in!`),
        onError: (ctx) => console.log(ctx.error.message),
      },
    });

    if (error) throw new Error(error.message);

    setToken(data.token);
  }

  async function socialLogin(providerName: string) {
    const { error } = await authClient.signIn.social({
      provider: providerName,
      callbackURL: frontendBase,
      fetchOptions: {
        onSuccess: () => console.log(`Logged in via ${providerName}`),
      },
    });

    if (error) throw new Error(error.message);

    const accessToken = await getAccessToken(providerName);
    setToken(accessToken);
  }

  async function getAccessToken(providerName: string): Promise<string | null> {
    const { data, error } = await authClient.getAccessToken({
      providerId: providerName,
    });

    if (error) throw new Error(error.message);

    return data.accessToken;
  }

  async function sendResetPasswordLink(email: string) {
    await authClient.requestPasswordReset({
      email,
      redirectTo: resetPasswordBase,
      fetchOptions: {
        onSuccess: () =>
          console.log(`Reset password link is sent to: ${email}`),
        onError: (ctx) => console.log(ctx.error.message),
      },
    });
  }

  async function resetPassword(newPassword: string) {
    const token = new URLSearchParams(window.location.search).get('token');

    if (!token)
      throw new Error(
        'No token found. Please go again to this page via email or request for another link'
      );

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

  async function logout() {
    const { error } = await authClient.signOut({
      fetchOptions: {
        onSuccess: () => console.log('User logged out successfully!'),
        onError: (ctx) => console.log(ctx.error.message),
      },
    });

    if (error) throw new Error(error.message);

    setToken(null);
  }

  return {
    authToken,
    isLoggedIn,
    signup,
    login,
    socialLogin,
    sendResetPasswordLink,
    resetPassword,
    logout,
  };
});
