<script lang="ts" setup>
import { trpc } from '@/trpc';
import { useRoute } from 'vue-router';
import type { RecipesPublic } from '@server/shared/types';
import { onBeforeMount, ref } from 'vue';
import { titleCase } from 'title-case';
import { format } from 'date-fns';

const route = useRoute();
const recipe = ref<RecipesPublic>();

const recipeId = Number(route.params.id);

onBeforeMount(async () => {
  recipe.value = await trpc.recipes.findById.query(recipeId);
});
</script>

<template>
  <div v-if="recipe" class="mx-4 mt-8 mb-12 md:mx-32 md:mt-10 md:mb-14">
    <div class="flex flex-col gap-20">
      <div class="flex gap-10">
        <div class="flex w-full flex-col gap-2">
          <div class="flex items-start justify-between">
            <div class="justify-center overflow-hidden">
              <span class="text-submit-text font-bold md:text-6xl"
                >{{ titleCase(recipe.title) }}
              </span>
            </div>
            <div class="flex justify-start">
              <button
                type="button"
                class="rounded-3xl bg-red-400 px-6 py-2 text-xl leading-tight font-medium text-white hover:scale-105"
              >
                Delete
              </button>
            </div>
          </div>
          <div class="flex flex-col items-start justify-start">
            <div class="justify-center leading-loose text-gray-500">
              <span class="">{{ recipe.author.name }} </span>
              <span class="">
                • {{ format(recipe.createdAt, 'd MMM yyyy') }}
              </span>
            </div>
            <div class="justify-center leading-loose text-gray-500">
              <span>Cook duration {{ recipe.duration }} minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
