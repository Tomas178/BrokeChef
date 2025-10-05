import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { authClient } from '@/lib/auth-client';
import { frontendBase, resetPasswordBase } from '@/config';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', () => {
  const authToken = ref<string | null>(localStorage.getItem('authToken'));
  const router = useRouter();

  const session = authClient.useSession();
  const id = ref<string | undefined>(undefined);

  watch(
    () => session.value?.data?.session,
    (session) => {
      if (session?.token) setToken(session.token);
      if (session?.id) id.value = session.userId;
    },
    { immediate: true }
  );

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

  async function updatePassword(credentials: {
    currentPassword: string;
    newPassword: string;
  }) {
    const { currentPassword, newPassword } = credentials;

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (error) throw new Error(error.message);
  }

  async function updateEmail(newEmail: string) {
    const { error } = await authClient.changeEmail({
      newEmail,
    });

    if (error) throw new Error(error.message);
  }

  async function logout() {
    const { error } = await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          console.log('User logged out successfully!');
          await router.push({ name: 'Login' });
        },
        onError: (ctx) => console.log(ctx.error.message),
      },
    });

    if (error) throw new Error(error.message);

    setToken(null);
  }

  return {
    authToken,
    isLoggedIn,
    id,
    signup,
    login,
    socialLogin,
    sendResetPasswordLink,
    resetPassword,
    updatePassword,
    updateEmail,
    logout,
  };
});
