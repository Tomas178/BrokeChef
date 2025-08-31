<script setup lang="ts">
import RecipeCard from '@/components/RecipeCard.vue';
import { trpc } from '@/trpc';
import type { Pagination } from '@server/shared/pagination';
import type { RecipesPublic } from '@server/shared/types';
import { onMounted, reactive, ref } from 'vue';

const recipes = ref<RecipesPublic[]>([]);

const limit = 4;

const pagination = reactive<Pagination>({
  offset: 0,
  limit: limit,
});

const fetchRecipes = async () => {
  const fetchedRecipes = await trpc.recipes.findAll.query(pagination);

  console.log(recipes.value);

  recipes.value.push(...fetchedRecipes);
};

const fetchMoreRecipes = async () => {
  pagination.offset += limit;

  await fetchRecipes();
};

onMounted(fetchRecipes);
</script>

<template>
  <div class="m-4 flex flex-col gap-10 lg:mx-32 lg:my-8 lg:gap-13">
    <div
      class="flex flex-col items-center justify-center gap-4 lg:mx-20 lg:gap-6"
    >
      <div class="flex flex-col text-center text-3xl font-bold lg:text-6xl">
        <span class="text-primary-green">Explore Simple &</span>
        <span class="text-header">Tasty Recipes</span>
      </div>
      <span class="text-center font-medium text-wrap lg:mx-9">
        Dive into our recipes, where every dish is a memory in the making. Come,
        cook, and create with us!
      </span>
    </div>
    <div class="flex flex-col">
      <div
        class="grid grid-cols-1 justify-center gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-10"
      >
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>
      <button
        type="button"
        @click="fetchMoreRecipes"
        class="text-primary-green mt-4 cursor-pointer tracking-wide hover:scale-105 lg:text-4xl"
      >
        More
      </button>
    </div>
  </div>
</template>
