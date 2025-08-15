<script setup lang="ts">
import Header from '@/components/Header.vue';
// import { isLoggedIn } from '@/stores/user';
import { computed } from 'vue';

const links = computed(() => [{ label: 'Explore recipes', name: 'Home' }]);
</script>

<template>
  <Header :links="links">
    <!-- <template #menu>
      <FwbNavbarLink v-if="isLoggedIn">Logout</FwbNavbarLink>
    </template> -->
  </Header>
</template>
