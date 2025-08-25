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
  <div class="flex-row md:relative md:mx-40 md:flex md:gap-18 md:py-8">
    <WelcomeText v-if="welcomeText" />
    <div
      class="bg-background-primary mt-4 flex-1 overflow-hidden rounded-tl-4xl rounded-tr-4xl md:overflow-visible md:rounded-4xl"
    >
      <div class="mx-4 flex flex-col gap-4 pt-10 md:py-8">
        <FwbHeading tag="h2">{{ heading }}</FwbHeading>

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
  </div>
</template>
