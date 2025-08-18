<script lang="ts" setup>
import { FwbToast } from 'flowbite-vue';

defineProps<{
  message: string;
}>();

const emit = defineEmits(['clear']);

function handleClose() {
  emit('clear');
}
</script>

<template>
  <fwb-toast
    v-if="message"
    data-testId="errorMessage"
    type="danger"
    closable
    @close="handleClose"
  >
    {{ message }}
  </fwb-toast>
</template>
