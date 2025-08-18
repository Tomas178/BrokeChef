<script lang="ts" setup>
import { FwbToast } from 'flowbite-vue';

defineProps<{
  message: string;
}>();
</script>

<template>
  <fwb-toast v-if="message" data-testId="errorMessage" closable type="danger">
    {{ message }}
  </fwb-toast>
</template>
