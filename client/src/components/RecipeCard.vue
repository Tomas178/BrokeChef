<script lang="ts" setup>
import type { RecipesPublic } from '@server/shared/types';
import { format } from 'date-fns';
import { titleCase } from 'title-case';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import Spinner from './Spinner.vue';
import { formatRecipeRating } from '@/utils/formatRecipeRating';

defineProps<{
  recipe: RecipesPublic;
  hoverScale: boolean;
}>();

const isLoading = ref(true);
</script>

<template>
  <RouterLink
    :to="{ name: 'Recipe', params: { id: recipe.id } }"
    :class="[
      'hover:outline-secondary-green relative flex w-full flex-col items-center rounded-md hover:outline-3',
      hoverScale ? 'hover:scale-105' : '',
    ]"
  >
    <div
      class="flex h-48 w-full items-center justify-center overflow-hidden rounded-md bg-gray-200 lg:h-84"
    >
      <Spinner v-show="isLoading" />
      <img
        v-show="!isLoading"
        :src="recipe.imageUrl"
        class="h-full w-full object-cover"
        :alt="recipe.title"
        @load="isLoading = false"
      />
    </div>

    <div
      class="flex w-full flex-1 flex-col rounded-md bg-black/10 p-2 lg:px-5 lg:py-3"
    >
      <div class="flex items-center gap-2 text-xs leading-loose sm:text-base">
        <span>{{ recipe.author.name }}</span>
        <span> • {{ format(recipe.createdAt, 'd MMM yyyy') }}</span>
        <span
          v-if="recipe.rating"
          class="text-rating font-semibold md:ml-auto lg:text-2xl"
        >
          ★ {{ formatRecipeRating(recipe.rating) }}/5
        </span>
        <span v-else class="font-semibold text-red-500 md:ml-auto lg:text-2xl">
          No ratings
        </span>
      </div>
      <span class="mt-2 inline-flex font-bold text-slate-700 lg:text-2xl">
        {{ titleCase(recipe.title.toLowerCase()) }}
      </span>
    </div>
  </RouterLink>
</template>
