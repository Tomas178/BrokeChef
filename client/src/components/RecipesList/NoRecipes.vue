<script lang="ts" setup>
import { ROUTE_NAMES } from '@/router/consts/routeNames';
import { RECIPE_TYPE, type RecipeTypeValues } from './types';

defineProps<{
  recipeType: RecipeTypeValues;
}>();
</script>

<template>
  <div v-if="recipeType === RECIPE_TYPE.SAVED" class="text-center">
    <RouterLink
      :to="{ name: ROUTE_NAMES.HOME }"
      class="text-primary-green hover:text-secondary-green text-xl lg:text-3xl"
    >
      Go and Explore Recipes
    </RouterLink>
  </div>

  <div v-else class="text-center">
    <RouterLink
      :to="{ name: ROUTE_NAMES.CREATE_RECIPE }"
      class="text-primary-green hover:text-secondary-green text-xl lg:text-3xl"
    >
      Go and Create Recipes
    </RouterLink>
  </div>
</template>
