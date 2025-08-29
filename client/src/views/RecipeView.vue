<script lang="ts" setup>
import { trpc } from '@/trpc';
import { useRoute, useRouter } from 'vue-router';
import type { RecipesPublicAllInfo } from '@server/shared/types';
import { onBeforeMount, ref } from 'vue';
import { titleCase } from 'title-case';
import { format } from 'date-fns';
import useErrorMessage from '@/composables/useErrorMessage';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import Card from '@/components/Card.vue';

const route = useRoute();
const router = useRouter();

const recipe = ref<RecipesPublicAllInfo>();
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

const [deleteRecipe] = useErrorMessage(async () => {
  await toast.promise(trpc.recipes.remove.mutate(recipeId), {
    pending: 'Removing recipe...',
    success: 'Recipe removed!',
    error: {
      render(err) {
        if (err?.data?.message) return err.data.message;
        return DEFAULT_SERVER_ERROR;
      },
    },
  });

  router.push({
    name: 'Home',
  });
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
  <div v-if="recipe">
    <div class="relative w-full">
      <img
        :src="recipe.imageUrl"
        :alt="`${recipe.title} Image`"
        class="h-64 w-full object-cover md:h-96"
      />
    </div>

    <div class="mx-4 mt-8 mb-12 md:mx-32 md:mt-10 md:mb-14">
      <div class="flex flex-col gap-20">
        <div class="flex flex-col gap-10">
          <div class="flex w-full flex-col gap-2">
            <div class="flex items-start justify-between">
              <div class="justify-center">
                <span class="text-submit-text text-3xl font-bold lg:text-6xl"
                  >{{ titleCase(recipe.title) }}
                </span>
              </div>
              <div class="flex justify-start">
                <button
                  v-if="isAuthor"
                  @click="deleteRecipe"
                  type="button"
                  class="rounded-3xl bg-red-400/90 px-6 py-2 text-xl leading-tight font-medium text-white hover:scale-105"
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
            <div class="flex flex-col">
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
          <div
            class="flex flex-col gap-4 self-stretch lg:flex-row lg:justify-between"
          >
            <Card title="Ingredients" :items="recipe.ingredients" />
            <Card title="Tools" :items="recipe.tools" />
          </div>
        </div>
        <div class="flex flex-col gap-6">
          <span class="text-3xl font-bold text-gray-500">Steps</span>
          <ol
            class="ol-marker flex list-inside flex-col gap-4 md:list-outside md:pl-15"
          >
            <li
              v-for="step in recipe.steps"
              :key="step"
              class="rounded-3xl bg-white/10 px-8 py-6 leading-loose shadow-xl backdrop-blur-lg"
            >
              {{ step }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
ol {
  list-style-type: decimal-leading-zero;
}
</style>
