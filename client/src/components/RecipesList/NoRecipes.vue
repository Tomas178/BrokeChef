<script lang="ts" setup>
import { ROUTE_NAMES } from '@/router/consts/routeNames';
import { RECIPE_TYPE, type RecipeTypeValues } from './types';

const props = defineProps<{
  recipeType: RecipeTypeValues;
}>();

const isRecipeTypeSaved = props.recipeType === RECIPE_TYPE.SAVED;

const route = isRecipeTypeSaved
  ? { name: ROUTE_NAMES.HOME }
  : { name: ROUTE_NAMES.CREATE_RECIPE };

const text = isRecipeTypeSaved
  ? 'Go and Explore Recipes'
  : 'Go and Create Recipes';
</script>

<template>
  <RouterLink
    :to="route"
    class="text-primary-green hover:text-secondary-green text-xl lg:text-3xl"
  >
    {{ text }}
  </RouterLink>
</template>
