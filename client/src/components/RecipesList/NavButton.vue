<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue';

defineProps<{
  direction: 'left' | 'right';
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <fwb-button
    @click="$emit('click')"
    class="absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer"
    :class="
      direction === 'left'
        ? 'left-0 -translate-x-1/2 -scale-x-100'
        : 'right-0 translate-x-1/2'
    "
    gradient="green"
    pill
    square
  >
    <svg
      class="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        fill-rule="evenodd"
      />
    </svg>
  </fwb-button>
</template>
