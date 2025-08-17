<script setup lang="ts">
import WelcomeText from './WelcomeText.vue';
import { FwbHeading } from 'flowbite-vue';

defineProps<{
  heading: string;
  formLabel: string;
  welcomeText: boolean;
}>();

defineEmits<{
  submit: [];
}>();
</script>

<template>
  <WelcomeText v-if="welcomeText" />
  <div
    class="bg-background-primary mt-4 w-full max-w-screen overflow-hidden rounded-tl-4xl rounded-tr-4xl"
  >
    <div class="mx-4 flex flex-col gap-4 pt-10">
      <fwb-heading tag="h2">{{ heading }}</fwb-heading>

      <div class="flex flex-col gap-4">
        <form
          :aria-label="formLabel"
          @submit.prevent="$emit('submit')"
          class="space-y-2"
        >
          <slot />
        </form>
      </div>
    </div>
  </div>
</template>
