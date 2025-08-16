<script setup lang="ts">
import { FwbNavbar, FwbNavbarCollapse, FwbNavbarLink } from 'flowbite-vue';
import { useRoute, RouterLink } from 'vue-router';
import { computed } from 'vue';

const { links } = defineProps<{
  links: {
    label: string;
    name: string;
  }[];
}>();

const route = useRoute();

const navigation = computed(() =>
  links.map((item) => ({
    ...item,
    isActive: route.name === item.name,
  }))
);
</script>

<template>
  <fwb-navbar>
    <template #logo>
      <RouterLink :to="{ name: 'Home' }" class="flex items-center space-x-2">
        <img src="@/assets/logo.svg" alt="BrokChef Logo" class="h-12 w-auto" />
        <span class="text-header text-base font-bold">BrokeChef</span>
      </RouterLink>
    </template>

    <template #default="{ isShowMenu }">
      <fwb-navbar-collapse class="links-background" :is-show-menu="isShowMenu">
        <fwb-navbar-link
          class="font-bold"
          v-for="link in navigation"
          :key="`${link.name}-${String(route.name)}`"
          :is-active="link.isActive"
          :link="{ name: link.name } as any"
          link-attr="to"
          component="RouterLink"
        >
          {{ link.label }}
        </fwb-navbar-link>
      </fwb-navbar-collapse>
    </template>
  </fwb-navbar>
</template>

<style scoped>
.links-background :deep(ul) {
  background-color: var(--color-background-primary);
}
</style>
