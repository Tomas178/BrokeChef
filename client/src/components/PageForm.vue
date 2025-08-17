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
  <div class="bg-background-primary mt-4 rounded-tl-4xl rounded-tr-4xl">
    <div
      class="mt-12 ml-4 inline-flex flex-col items-start justify-center gap-6"
    >
      <fwb-heading tag="h2">{{ heading }}</fwb-heading>

      <div class="self-strech flex flex-col items-start justify-start gap-4">
        <form
          class=""
          :aria-label="formLabel"
          @submit.prevent="$emit('submit')"
        >
          <slot />
        </form>

        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
