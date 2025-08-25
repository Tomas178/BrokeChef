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
  <FwbNavbar class="relative">
    <template #logo>
      <RouterLink :to="{ name: 'Home' }" class="flex items-center space-x-2">
        <img src="@/assets/logo.svg" alt="BrokChef Logo" class="h-12 w-auto" />
        <span class="text-header md:text-extrabold font-bold md:text-2xl"
          >BrokeChef</span
        >
      </RouterLink>
    </template>

    <template #default="{ isShowMenu }">
      <div class="md:px-4">
        <FwbNavbarCollapse
          class="links-background absolute top-12 right-0 md:static"
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
      </div>
    </template>
  </FwbNavbar>

  <main>
    <div class="container flex flex-col">
      <RouterView />
    </div>
  </main>
</template>

<style scoped>
.links-background :deep(ul) {
  background-color: var(--color-background-primary);
}

@media ((width >=768px)) {
  .links-background :deep(ul) {
    background-color: white;
  }
}
</style>
