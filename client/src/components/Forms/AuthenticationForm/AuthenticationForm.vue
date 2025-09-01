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
  <div
    class="@:h-full flex-row justify-center lg:relative lg:mx-14 lg:my-8 lg:flex lg:gap-4"
  >
    <WelcomeText v-if="welcomeText" />
    <div
      class="bg-background-form mt-4 h-full flex-1 overflow-hidden rounded-tl-4xl rounded-tr-4xl lg:overflow-visible lg:rounded-4xl"
    >
      <div class="mx-4 flex flex-col gap-4 py-8 pt-10">
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
