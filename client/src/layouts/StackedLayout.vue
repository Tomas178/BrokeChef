<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { FwbNavbar, FwbNavbarCollapse, FwbNavbarLink } from 'flowbite-vue';

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
  <FwbNavbar class="relative z-50">
    <template #logo>
      <RouterLink
        :to="{ name: 'Home' }"
        class="flex items-center space-x-2 hover:scale-105"
      >
        <img src="@/assets/logo.svg" alt="BrokChef Logo" class="h-12 w-auto" />
        <span class="text-header md:text-extrabold font-bold md:text-2xl"
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
          class="font-bold"
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
:deep(ul > a) {
  background-color: var(--color-background-form);
}

:deep(ul .router-link-exact-active) {
  background-color: var(--color-primary-green);
}

@media ((width >= 768px)) {
  :deep(ul .router-link-exact-active) {
    background-color: white;
  }

  :deep(.router-link-exact-active) {
    background-color: white;
    color: var(--color-primary-green);
  }

  :deep(a:hover) {
    color: var(--color-secondary-green);
  }
}
</style>
