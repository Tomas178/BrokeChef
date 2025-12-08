<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { FwbNavbar, FwbNavbarCollapse, FwbNavbarLink } from 'flowbite-vue';
import { ROUTE_NAMES, type RouteNamesValues } from '@/router/consts/routeNames';
import { onMounted } from 'vue';

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

const isDarkMode = ref(false);

watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    isDarkMode.value = true;
  } else {
    isDarkMode.value = false;
  }
});
</script>

<template>
  <FwbNavbar class="dark:bg-background-navbar-dark relative z-50">
    <template #logo>
      <RouterLink
        :to="{ name: ROUTE_NAMES.HOME }"
        class="flex items-center space-x-2 hover:scale-105"
      >
        <img src="@/assets/logo.svg" alt="BrokeChef Logo" class="h-12 w-auto" />
        <span
          class="text-header-light md:text-extrabold dark:text-header-dark font-bold md:text-2xl"
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

        <button
          type="button"
          @click="isDarkMode = !isDarkMode"
          class="hover:text-secondary-green ml-4 flex cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-gray-500 dark:bg-inherit dark:text-gray-400 dark:hover:text-white"
        >
          <span
            v-if="isDarkMode"
            class="material-symbols-outlined text-yellow-300"
          >
            light_mode
          </span>
          <span v-else class="material-symbols-outlined text-gray-600">
            dark_mode
          </span>
        </button>
      </FwbNavbarCollapse>
    </template>
  </FwbNavbar>

  <slot />
</template>

<style scoped>
@reference "../assets/index.css";

:deep(ul) {
  @apply items-center;
}

:deep(ul > a) {
  @apply bg-background-form-light flex items-center justify-center px-3 py-2 dark:bg-inherit;
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
