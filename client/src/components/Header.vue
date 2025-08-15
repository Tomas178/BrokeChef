<script setup lang="ts">
import {
  FwbNavbar,
  FwbNavbarLogo,
  FwbNavbarCollapse,
  FwbNavbarLink,
} from 'flowbite-vue';
import logoUrl from '@/assets/logo.svg';
import { useRoute } from 'vue-router';
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
      <fwb-navbar-logo
        alt="BrokChef Logo"
        :image-url="logoUrl"
        link-attr="to"
        component="RouterLink"
        :link="{ name: 'Home' } as any"
      >
        <span class="text-header font-bold">BrokeChef</span>
      </fwb-navbar-logo>
    </template>

    <template #default="{ isShowMenu }">
      <fwb-navbar-collapse class="fill-black" :is-show-menu="isShowMenu">
        <fwb-navbar-link
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
