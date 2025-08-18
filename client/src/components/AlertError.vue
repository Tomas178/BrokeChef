<script lang="ts" setup>
import { FwbAlert } from 'flowbite-vue';

defineProps<{
  message: string;
}>();
</script>

<template>
  <fwb-alert v-if="message" data-testId="errorMessage" type="danger">
    {{ message }}
  </fwb-alert>
</template>
