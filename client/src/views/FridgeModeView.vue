<script setup lang="ts">
import GeneratedRecipeCard from '@/components/GeneratedRecipeCard.vue';
import Spinner from '@/components/Spinner.vue';
import useErrorMessage from '@/composables/useErrorMessage';
import { useRecipesService } from '@/composables/useRecipesService';
import { apiOrigin } from '@/config';
import { useUserStore } from '@/stores/user';
import { type GeneratedRecipe, type RecipeSSEData } from '@server/shared/types';
import axios from 'axios';
import { FwbButton, FwbFileInput } from 'flowbite-vue';
import { onUnmounted, ref } from 'vue';
import { RecipeGenerationStatus } from '@server/shared/enums';

const fridgeImageFile = ref<File | undefined>(undefined);
const recipes = ref<GeneratedRecipe[]>([]);
const isGeneratingRecipes = ref(false);
const eventSource = ref<EventSource | undefined>(undefined);

const { id: userId } = useUserStore();

const {
  recipeForm,
  recipeImageFile,
  handleCreateRecipe: createRecipe,
} = useRecipesService();

async function base64ToFile(dataUrl: string, filename: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return new File([blob], filename, { type: blob.type });
}

async function fillRecipeForm(recipe: GeneratedRecipe) {
  recipeForm.title = recipe.title;
  recipeForm.duration = recipe.duration;
  recipeForm.ingredients = recipe.ingredients;
  recipeForm.tools = recipe.tools;
  recipeForm.steps = recipe.steps;

  recipeImageFile.value = await base64ToFile(
    recipe.imageUrl,
    `${recipe.title.toLowerCase().replace(/\s+/g, '-')}.jpg`
  );
}

async function handleCreateRecipe(recipe: GeneratedRecipe) {
  await fillRecipeForm(recipe);
  await createRecipe();
}

function closeEventSource() {
  if (eventSource.value) {
    eventSource.value.close();
    eventSource.value = undefined;
  }
}

onUnmounted(() => closeEventSource());

const [startRecipeGeneration, errorMessage] = useErrorMessage(async () => {
  if (!fridgeImageFile.value) {
    throw new Error(
      'Please upload an image (Supported types: .jpeg, .jpg, .png)'
    );
  }

  if (!userId) {
    throw new Error('User not authenticated!');
  }

  errorMessage.value = '';
  recipes.value = [];
  isGeneratingRecipes.value = true;
  closeEventSource();

  const sseUrl = `${apiOrigin}/api/recipe/events/${userId}`;
  eventSource.value = new EventSource(sseUrl, { withCredentials: true });

  eventSource.value.onmessage = (event) => {
    try {
      const data: RecipeSSEData = JSON.parse(event.data);

      if (data.status === RecipeGenerationStatus.ERROR) {
        throw new Error(data.message);
      }

      if (data.status === RecipeGenerationStatus.SUCCESS) {
        recipes.value = data.recipes;
        isGeneratingRecipes.value = false;
        closeEventSource();
      }
    } catch (error) {
      console.error(`Error parsing SSE data`, error);
      errorMessage.value = 'Received invalid data from server';
      isGeneratingRecipes.value = false;
      closeEventSource();
    }
  };

  eventSource.value.onerror = (err) => {
    console.error('SSE Error:', err);
    if (eventSource.value?.readyState === EventSource.CLOSED) {
      errorMessage.value = 'Connection lost. Please try again.';
      isGeneratingRecipes.value = false;
    }
  };

  const formData = new FormData();
  formData.append('file', fridgeImageFile.value);
  const uploadEndpoint = `${apiOrigin}/api/recipe/generate`;

  await axios.post(uploadEndpoint, formData, { withCredentials: true });
});

async function handleGenerateRecipes() {
  await startRecipeGeneration();
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <FwbFileInput
      v-model="fridgeImageFile"
      dropzone
      accept="image/*"
      label="Upload Fridge Image"
    />

    <div class="flex items-center justify-center">
      <FwbButton
        class="text-submit-text dark:text-submit-text-dark gradient-action-button cursor-pointer rounded-4xl p-2 text-center font-bold hover:outline-1 hover:outline-black"
        @click="handleGenerateRecipes"
      >
        <template #prefix>
          <Spinner v-if="isGeneratingRecipes" />
        </template>
        Generate Recipes
      </FwbButton>
    </div>

    <p
      v-if="errorMessage"
      class="inline-flex items-center justify-center text-red-600"
    >
      {{ errorMessage }}
    </p>

    <div v-if="recipes.length" class="flex flex-col gap-4">
      <h2 class="text-2xl font-bold">Choose a Recipe</h2>
      <ul class="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        <li
          v-for="(recipe, index) in recipes"
          :key="index"
          class="flex flex-col gap-2"
        >
          <GeneratedRecipeCard :recipe="recipe" />
          <FwbButton
            @click="handleCreateRecipe(recipe)"
            class="gradient-action-button text-submit-text w-full cursor-pointer rounded-3xl py-2 font-bold hover:outline-2 hover:outline-black dark:hover:outline-white"
          >
            Create This Recipe
          </FwbButton>
        </li>
      </ul>
    </div>
  </div>
</template>
