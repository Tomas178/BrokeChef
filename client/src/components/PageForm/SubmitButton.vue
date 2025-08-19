<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue';
const { actionName } = defineProps<{
  actionName: string;
}>();
</script>

<template>
  <div class="flex items-center justify-center">
    <fwb-button
      class="text-submit-text gradient-action-button mr-3 w-full rounded-4xl font-bold"
      type="submit"
      size="xl"
      pill
      >{{ actionName }}</fwb-button
    >
  </div>
</template>
