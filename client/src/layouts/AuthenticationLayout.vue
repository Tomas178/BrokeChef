<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue';
import { useUserStore } from '@/stores/user';
import StackedLayout from './StackedLayout.vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const user = useUserStore();

const router = useRouter();

const links = computed(() => [
  { label: 'Explore recipes', name: 'Home' },

  ...(user.isLoggedIn
    ? [
        { label: 'Create a recipe', name: 'CreateRecipe' },
        { label: 'Profile', name: 'MyProfile' },
      ]
    : [
        { label: 'Login', name: 'Login' },
        { label: 'Signup', name: 'Signup' },
      ]),
]);

function logoutUser() {
  user.logout();
  router.push({ name: 'Login' });
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink
        v-if="user.isLoggedIn"
        @click.prevent="logoutUser"
        class="font-bold"
        link="#"
      >
        Logout
      </FwbNavbarLink>
    </template>
    <main>
      <div class="flex min-h-screen flex-col">
        <RouterView />
      </div>
    </main>
  </StackedLayout>
</template>
