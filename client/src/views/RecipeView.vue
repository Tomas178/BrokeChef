<script lang="ts" setup>
import { trpc } from '@/trpc';
import { useRoute } from 'vue-router';
import type { RecipesPublic } from '@server/shared/types';
import { onBeforeMount, ref } from 'vue';
import { titleCase } from 'title-case';
import { format } from 'date-fns';
import useErrorMessage from '@/composables/useErrorMessage';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { DEFAULT_SERVER_ERROR } from '@/consts';

const route = useRoute();

const recipe = ref<RecipesPublic>();
const isAuthor = ref(false);
const isSaved = ref(false);

const recipeId = Number(route.params.id);

onBeforeMount(async () => {
  recipe.value = await trpc.recipes.findById.query(recipeId);
  isAuthor.value = await trpc.recipes.isAuthor.query(recipeId);
  isSaved.value = await trpc.savedRecipes.isSaved.query(recipeId);
  console.log(recipe.value);
  console.log(isAuthor.value);
  console.log(isSaved.value);
});

const [saveRecipe] = useErrorMessage(async () => {
  await toast.promise(trpc.savedRecipes.save.mutate(recipeId), {
    pending: 'Saving recipe...',
    success: {
      render() {
        isSaved.value = true;
        return 'Recipe saved successfully';
      },
    },
    error: {
      render(err) {
        if (err?.data?.message) return err.data.message;
        return DEFAULT_SERVER_ERROR;
      },
    },
  });
});

const [unsaveRecipe] = useErrorMessage(async () => {
  await toast.promise(trpc.savedRecipes.unsave.mutate(recipeId), {
    pending: 'Unsaving recipe...',
    success: {
      render() {
        isSaved.value = false;
        return 'Recipe unsaved successfully';
      },
    },
    error: {
      render(err) {
        if (err?.data?.message) return err.data.message;
        return DEFAULT_SERVER_ERROR;
      },
    },
  });
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
                v-if="isAuthor"
                type="button"
                class="rounded-3xl bg-red-400 px-6 py-2 text-xl leading-tight font-medium text-white hover:scale-105"
              >
                Delete
              </button>
              <button
                v-else-if="!isSaved"
                @click="saveRecipe"
                type="button"
                class="gradient-action-button rounded-3xl px-6 py-2 text-xl leading-tight font-medium text-white hover:scale-105"
              >
                Save
              </button>
              <button
                v-else
                @click="unsaveRecipe"
                type="button"
                class="gradient-action-button rounded-3xl px-6 py-2 text-xl leading-tight font-medium text-white hover:scale-105"
              >
                Unsave
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
