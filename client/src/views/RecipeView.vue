<script lang="ts" setup>
import { trpc } from '@/trpc';
import { useRoute, useRouter } from 'vue-router';
import type { RecipesPublicAllInfo } from '@server/shared/types';
import { onBeforeMount, ref } from 'vue';
import { titleCase } from 'title-case';
import { format } from 'date-fns';
import useErrorMessage from '@/composables/useErrorMessage';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import RecipeDetailsCard from '@/components/RecipeDetailsCard.vue';
import Spinner from '@/components/Spinner.vue';
import useToast from '@/composables/useToast';

const { showLoading, updateToast } = useToast();

const route = useRoute();
const router = useRouter();

const recipe = ref<RecipesPublicAllInfo>();
const isAuthor = ref(false);
const isSaved = ref(false);

const isLoading = ref(true);

const recipeId = Number(route.params.id);

onBeforeMount(async () => {
  recipe.value = await trpc.recipes.findById.query(recipeId);
  isAuthor.value = await trpc.recipes.isAuthor.query(recipeId);
  isSaved.value = await trpc.savedRecipes.isSaved.query(recipeId);
  console.log(recipe.value);
  console.log(isAuthor.value);
  console.log(isSaved.value);
});

const [deleteRecipe, deleteErrorMessage] = useErrorMessage(
  async () => await trpc.recipes.remove.mutate(recipeId),
  true
);

async function handleDelete() {
  const id = showLoading('Removing Recipe...');

  try {
    await deleteRecipe();

    updateToast(id, 'success', 'Recipe Removed!');

    router.push({
      name: 'Home',
    });
  } catch {
    updateToast(id, 'error', deleteErrorMessage.value || DEFAULT_SERVER_ERROR);
  }
}

const [saveRecipe, saveErrorMessage] = useErrorMessage(
  async () => await trpc.savedRecipes.save.mutate(recipeId),
  true
);

async function handleSave() {
  const id = showLoading('Saving recipe...');

  try {
    await saveRecipe();

    updateToast(id, 'success', 'Recipe saved successfully');

    isSaved.value = true;
  } catch {
    updateToast(id, 'error', saveErrorMessage.value || DEFAULT_SERVER_ERROR);
  }
}

const [unsaveRecipe, unsaveErrorMessage] = useErrorMessage(
  async () => await trpc.savedRecipes.unsave.mutate(recipeId),
  true
);

async function handleUnsave() {
  const id = showLoading('Unsaving recipe...');

  try {
    await unsaveRecipe();

    updateToast(id, 'success', 'Recipe unsaved successfully');

    isSaved.value = false;
  } catch {
    updateToast(id, 'error', unsaveErrorMessage.value || DEFAULT_SERVER_ERROR);
  }
}
</script>

<template>
  <div v-if="recipe">
    <div class="relative w-full">
      <div class="flex h-64 w-full items-center justify-center lg:h-104">
        <Spinner v-show="isLoading" />
        <img
          v-show="!isLoading"
          :src="recipe.imageUrl"
          :alt="recipe.title"
          class="h-full w-full object-cover"
          @load="isLoading = false"
        />
      </div>
    </div>

    <div class="mx-4 mt-8 mb-12 md:mx-16 md:mt-10 md:mb-14 lg:mx-32">
      <div class="flex flex-col gap-20">
        <div class="flex flex-col gap-10">
          <div class="flex w-full flex-col gap-2">
            <div class="flex items-start justify-between">
              <div class="justify-center">
                <span class="text-submit-text text-3xl font-bold lg:text-6xl"
                  >{{ titleCase(recipe.title.toLowerCase()) }}
                </span>
              </div>
              <div class="flex justify-start">
                <button
                  v-if="isAuthor"
                  @click="handleDelete"
                  type="button"
                  class="cursor-pointer rounded-3xl bg-red-400/90 px-6 py-2 text-xl leading-tight font-medium text-white hover:scale-105"
                >
                  Delete
                </button>
                <button
                  v-else-if="!isSaved"
                  @click="handleSave"
                  type="button"
                  class="gradient-action-button cursor-pointer rounded-3xl px-6 py-2 text-xl leading-tight font-medium text-white hover:scale-105"
                >
                  Save
                </button>
                <button
                  v-else
                  @click="handleUnsave"
                  type="button"
                  class="gradient-action-button cursor-pointer rounded-3xl px-6 py-2 text-xl leading-tight font-medium text-white hover:scale-105"
                >
                  Unsave
                </button>
              </div>
            </div>
            <div class="flex flex-col">
              <div class="justify-center leading-loose text-gray-500">
                <span class="text-primary-green">
                  <RouterLink
                    :to="{ name: 'UserProfile', params: { id: recipe.userId } }"
                  >
                    {{ recipe.author.name }}
                  </RouterLink>
                </span>
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
            <RecipeDetailsCard
              title="Ingredients"
              :items="recipe.ingredients"
            />
            <RecipeDetailsCard title="Tools" :items="recipe.tools" />
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
