<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue';
const { actionName } = defineProps<{
  actionName: string;
}>();
</script>

<template>
  <div class="flex items-center justify-center">
    <FwbButton
      data-testid="submit-button"
      class="text-submit-text gradient-action-button w-full cursor-pointer rounded-4xl font-bold hover:scale-y-110 hover:outline-2"
      type="submit"
      size="xl"
      pill
      >{{ actionName }}
    </FwbButton>
  </div>
</template>
