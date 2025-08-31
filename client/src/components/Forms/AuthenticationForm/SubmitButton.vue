<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue';
const { actionName } = defineProps<{
  actionName: string;
}>();
</script>

<template>
  <div class="flex items-center justify-center">
    <FwbButton
      class="text-submit-tex gradient-action-button mr-3 w-full cursor-pointer rounded-4xl font-bold hover:scale-105"
      type="submit"
      size="xl"
      pill
      >{{ actionName }}
    </FwbButton>
  </div>
</template>
