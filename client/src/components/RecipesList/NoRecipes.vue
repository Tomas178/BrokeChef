<script lang="ts" setup>
import { RECIPE_TYPE, type recipeTypeKeys } from './types';

defineProps<{
  recipeType: recipeTypeKeys;
}>();
</script>

<template>
  <div v-if="recipeType === RECIPE_TYPE.SAVED" class="text-center">
    <RouterLink
      :to="{ name: 'Home' }"
      class="text-primary-green hover:text-secondary-green text-xl lg:text-3xl"
    >
      Go and Explore Recipes
    </RouterLink>
  </div>

  <div v-else class="text-center">
    <RouterLink
      :to="{ name: 'CreateRecipe' }"
      class="text-primary-green hover:text-secondary-green text-xl lg:text-3xl"
    >
      Go and Create Recipes
    </RouterLink>
  </div>
</template>
