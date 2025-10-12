<script lang="ts" setup>
import type { RecipesPublic } from '@server/shared/types';
import { format } from 'date-fns';
import { titleCase } from 'title-case';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import Spinner from './Spinner.vue';
import { formatRecipeRating } from '@/utils/formatRecipeRating';
import { ROUTE_NAMES } from '@/router/consts/routeNames';
import {
  RECIPE_CARD_VARIANT,
  type RecipeCardVariant,
} from '@/types/recipeCard';

const { recipe, variant } = defineProps<{
  recipe: RecipesPublic;
  variant: RecipeCardVariant;
}>();

const isLoading = ref(true);

const infoRowClasses = [
  'flex gap-2 text-xs leading-loose sm:text-base',
  variant === RECIPE_CARD_VARIANT.RECIPES_LIST
    ? 'flex-col md:flex-row md:gap-1'
    : '',
].join(' ');

const ratingClasses = [
  'font-semibold lg:text-2xl',
  variant === RECIPE_CARD_VARIANT.RECIPES_LIST
    ? 'md:mt-0 md:ml-auto'
    : 'ml-auto',
].join(' ');
</script>

<template>
  <RouterLink
    :to="{ name: ROUTE_NAMES.RECIPE, params: { id: recipe.id } }"
    class="hover:outline-secondary-green relative flex w-full flex-col items-center rounded-md hover:outline-3"
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
      <div :class="infoRowClasses">
        <span>{{ recipe.author.name }}</span>
        <span> • {{ format(recipe.createdAt, 'd MMM yyyy') }}</span>
        <div :class="ratingClasses">
          <span v-if="recipe.rating" class="text-rating">
            ★ {{ formatRecipeRating(recipe.rating) }}/5
          </span>
          <span v-else class="text-red-500"> Rate it! </span>
        </div>
      </div>
      <span
        class="mt-2 block overflow-hidden font-bold break-words text-slate-700 lg:text-2xl"
      >
        {{ titleCase(recipe.title.toLowerCase()) }}
      </span>
    </div>
  </RouterLink>
</template>
