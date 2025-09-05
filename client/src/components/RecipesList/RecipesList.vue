<script lang="ts" setup>
import type { RecipesPublic } from '@server/shared/types';
import RecipeCard from '@/components/RecipeCard.vue';
import NavButton from './NavButton.vue';
import NoRecipes from '@/components/RecipesList/NoRecipes.vue';
import type { recipeTypeKeys } from './types';
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  recipeType: recipeTypeKeys;
  recipes: RecipesPublic[];
  offset: number;
  limit: number;
  total: number;
}>();

defineEmits<{
  prevPage: [];
  nextPage: [];
}>();

const hasPrev = computed(() => props.offset > 0);
const hasNext = computed(() => props.offset + props.limit < props.total);
</script>

<template>
  <div class="flex flex-col gap-5 lg:gap-7">
    <span
      class="text-primary-green inline-flex self-start rounded-3xl px-2 py-1 text-lg font-bold shadow-md lg:px-6 lg:py-2 lg:text-3xl"
    >
      {{ title }}
    </span>
    <div v-if="recipes.length > 0" class="relative">
      <NavButton v-if="hasPrev" @click="$emit('prevPage')" direction="left" />

      <div class="flex gap-4 overflow-x-auto lg:gap-5">
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
          :hover-scale="false"
        />
      </div>

      <NavButton v-if="hasNext" @click="$emit('nextPage')" direction="right" />
    </div>

    <div v-else>
      <NoRecipes :recipe-type="recipeType" />
    </div>
  </div>
</template>
