<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { FwbNavbar, FwbNavbarCollapse, FwbNavbarLink } from 'flowbite-vue';
import { ROUTE_NAMES, type RouteNamesValues } from '@/router/consts/routeNames';

const { links } = defineProps<{
  links: {
    label: string;
    name: RouteNamesValues;
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
  <FwbNavbar class="relative z-50 dark:bg-white">
    <template #logo>
      <RouterLink
        :to="{ name: ROUTE_NAMES.HOME }"
        class="flex items-center space-x-2 hover:scale-105"
      >
        <img src="@/assets/logo.svg" alt="BrokChef Logo" class="h-12 w-auto" />
        <span
          class="text-header md:text-extrabold font-bold md:text-2xl dark:text-black"
          >BrokeChef</span
        >
      </RouterLink>
    </template>

    <template #default="{ isShowMenu }">
      <FwbNavbarCollapse
        class="absolute top-12 right-0 md:static"
        :is-show-menu="isShowMenu"
      >
        <FwbNavbarLink
          class="font-bold dark:bg-inherit"
          v-for="link in navigation"
          :key="`${link.name}-${String(route.name)}`"
          :is-active="link.isActive"
          :link="{ name: link.name } as any"
          link-attr="to"
          component="RouterLink"
        >
          {{ link.label }}
        </FwbNavbarLink>
        <slot name="menu" />
      </FwbNavbarCollapse>
    </template>
  </FwbNavbar>

  <slot />
</template>

<style scoped>
@reference "../assets/index.css";

:deep(ul > a) {
  @apply bg-background-form dark:bg-inherit;
}

:deep(ul .router-link-exact-active) {
  @apply bg-primary-green dark:bg-inherit;
}

@media ((width >= 768px)) {
  :deep(ul .router-link-exact-active) {
    @apply bg-white dark:bg-inherit;
  }

  :deep(.router-link-exact-active) {
    @apply text-primary-green bg-white dark:bg-inherit;
  }

  :deep(a:hover) {
    @apply text-secondary-green;
  }
}
</style>
