<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue';
import { useUserStore } from '@/stores/user';
import StackedLayout from './StackedLayout.vue';
import { computed } from 'vue';
import { ROUTE_NAMES } from '@/router/consts/routeNames';

const user = useUserStore();

const links = computed(() => [
  { label: 'Explore recipes', name: ROUTE_NAMES.HOME },

  ...(user.isLoggedIn
    ? [
        { label: 'Create a recipe', name: ROUTE_NAMES.CREATE_RECIPE },
        { label: 'Profile', name: ROUTE_NAMES.MY_PROFILE },
        { label: 'Fridge Mode', name: ROUTE_NAMES.FRIDGE_MODE },
      ]
    : [
        { label: 'Login', name: ROUTE_NAMES.LOGIN },
        { label: 'Signup', name: ROUTE_NAMES.SIGNUP },
      ]),
]);
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink
        v-if="user.isLoggedIn"
        @click.prevent="user.logout"
        class="font-bold dark:bg-inherit"
        link="#"
      >
        Logout
      </FwbNavbarLink>
    </template>
    <main>
      <div
        class="bg-background-main-light dark:bg-background-main-dark flex flex-col"
      >
        <RouterView />
      </div>
    </main>
  </StackedLayout>
</template>
