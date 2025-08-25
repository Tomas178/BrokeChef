<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue';
import { isLoggedIn, logout } from '@/stores/user';
import StackedLayout from './StackedLayout.vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();

const links = computed(() => [
  { label: 'Explore recipes', name: 'Home' },

  ...(isLoggedIn.value
    ? [{ label: 'Create a recipe', name: 'CreateRecipe' }]
    : [
        { label: 'Login', name: 'Login' },
        { label: 'Signup', name: 'Signup' },
      ]),
]);

function logoutUser() {
  logout();
  router.push({ name: 'Login' });
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink
        v-if="isLoggedIn"
        @click.prevent="logoutUser"
        class="font-bold"
        link="#"
      >
        Logout
      </FwbNavbarLink>
    </template>
  </StackedLayout>
</template>
