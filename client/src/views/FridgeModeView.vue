<script setup lang="ts">
import GeneratedRecipeCard from '@/components/GeneratedRecipeCard.vue';
import Spinner from '@/components/Spinner.vue';
import { useRecipesService } from '@/composables/useRecipesService';
import type { GeneratedRecipe } from '@server/shared/types';
import { FwbButton, FwbFileInput } from 'flowbite-vue';
import { ref } from 'vue';
import { useRecipeGeneratorStore } from '@/stores/recipeGenerator';
import { storeToRefs } from 'pinia';
import { assertValidFile } from '@/utils/assertValidFile';

const fridgeImageFile = ref<File | undefined>(undefined);

const recipeGeneratorStore = useRecipeGeneratorStore();

const { recipes, isGenerating, errorMessage } =
  storeToRefs(recipeGeneratorStore);

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
  recipeGeneratorStore.clearRecipes();
}

function handleGenerateRecipes() {
  if (!fridgeImageFile.value) {
    return;
  }

  try {
    assertValidFile(fridgeImageFile.value);
  } catch (error) {
    const message = (error as Error).message;
    errorMessage.value = message;
    recipeGeneratorStore.showToast(errorMessage.value, 'error');
    fridgeImageFile.value = undefined;
    return;
  }

  recipeGeneratorStore.generateRecipes(fridgeImageFile.value);
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <FwbFileInput
      v-model="fridgeImageFile"
      dropzone
      accept="image/png, image/jpeg, image/jpg"
      label="Upload Fridge Image"
    />

    <div class="flex items-center justify-center">
      <FwbButton
        class="text-submit-text dark:text-submit-text-dark gradient-action-button cursor-pointer rounded-4xl p-2 text-center font-bold hover:outline-1 hover:outline-black"
        @click="handleGenerateRecipes"
        :disabled="isGenerating"
      >
        <template #prefix>
          <Spinner v-if="isGenerating" />
        </template>
        {{ isGenerating ? 'Generating...' : 'Generate Recipes' }}
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
