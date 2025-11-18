<script setup lang="ts">
import { ref } from 'vue';
import Spinner from './Spinner.vue';
import type { GeneratedRecipe } from '@server/shared/types';

defineProps<{ recipe: GeneratedRecipe }>();

const isLoading = ref(true);

const handleImageLoad = () => {
  isLoading.value = false;
};

const handleImageError = () => {
  isLoading.value = false;
  console.error('Failed to load recipe image');
};
</script>

<template>
  <div class="flex flex-col">
    <div
      class="flex h-48 w-full items-center justify-center overflow-hidden rounded-md bg-gray-200 lg:h-72"
    >
      <Spinner v-show="isLoading" />
      <img
        v-show="!isLoading"
        :src="recipe.imageUrl"
        :alt="recipe.title"
        @load="handleImageLoad"
        @error="handleImageError"
        class="h-full w-full object-cover"
      />
    </div>

    <h3 class="text-xl font-bold">{{ recipe.title }}</h3>
    <p class="text-gray-600">⏱️ {{ recipe.duration }} minutes</p>

    <div class="flex flex-col gap-2 text-sm">
      <div>
        <strong>Ingredients:</strong>
        <span class="ml-1">{{ recipe.ingredients.join(', ') }}</span>
      </div>
      <div>
        <strong>Tools:</strong>
        <span class="ml-1">{{ recipe.tools.join(', ') }}</span>
      </div>
    </div>
  </div>
</template>
