<script setup lang="ts">
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/trpc';

const loginWithSocials = async (providerName: string) => {
  await authClient.signIn.social({
    provider: providerName,
    callbackURL: 'http://localhost:5173',
  });
};

const logout = async () => {
  await authClient.signOut();
};

const checkSession = async () => {
  try {
    const session = await trpc.auth.me.query();
    console.log('Session:', session);
  } catch (err) {
    console.error('Not authenticated:', err);
  }
};
</script>

<template>
  <button class="social-button" @click="loginWithSocials('github')">
    Login with GitHub
  </button>
  <button class="social-button" @click="loginWithSocials('google')">
    Login with Google
  </button>
  <button @click="checkSession">Check Session</button>
  <button @click="logout">Logout</button>
</template>

<style>
@reference '../assets/styles.css';

.social-button {
  @apply bg-blue-500;
}

button {
  @apply mx-2 cursor-pointer;
}
</style>
