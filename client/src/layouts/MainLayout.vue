<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue';
import { useUserStore } from '@/stores/user';
import StackedLayout from './StackedLayout.vue';
import { computed } from 'vue';

const user = useUserStore();

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
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink
        v-if="user.isLoggedIn"
        @click.prevent="user.logout"
        class="font-bold"
        link="#"
      >
        Logout
      </FwbNavbarLink>
    </template>
    <main>
      <div class="bg-background-main flex min-h-screen flex-col">
        <RouterView class="flex-1" />
      </div>
    </main>
  </StackedLayout>
</template>
