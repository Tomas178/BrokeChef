import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { authClient } from '@/lib/auth-client';
import { frontendBase, resetPasswordBase } from '@/config';
import { navigateToLogin } from '@/router/utils';

export const useUserStore = defineStore('user', () => {
  const authToken = ref<string | null>(null);

  const session = authClient.useSession();
  const id = ref<string | undefined>(undefined);

  watch(
    () => session.value?.data?.session,
    (session) => {
      if (session) {
        authToken.value = session.token;
        id.value = session.userId;
      } else {
        authToken.value = null;
        id.value = undefined;
      }
    },
    { immediate: true }
  );

  async function initialize() {
    const { data } = await authClient.getSession();
    if (data?.session) {
      authToken.value = data.session.token;
      id.value = data.session.userId;
    }
  }

  const isLoggedIn = computed(() => !!authToken.value);

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
    });

    if (error) throw new Error(error.message);
  }

  async function login(credentials: { email: string; password: string }) {
    const { email, password } = credentials;

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    authToken.value = data.token;
  }

  async function socialLogin(providerName: string) {
    const { error } = await authClient.signIn.social({
      provider: providerName,
      callbackURL: frontendBase,
    });

    if (error) throw new Error(error.message);
  }

  async function sendResetPasswordLink(email: string) {
    await authClient.requestPasswordReset({
      email,
      redirectTo: resetPasswordBase,
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
      callbackURL: frontendBase,
    });

    if (error) throw new Error(error.message);
  }

  async function logout() {
    const { error } = await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await navigateToLogin();
        },
      },
    });

    if (error) throw new Error(error.message);

    authToken.value = null;
  }

  return {
    authToken,
    isLoggedIn,
    id,
    initialize,
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
