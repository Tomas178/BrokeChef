import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { ref } from 'vue';
import { type GeneratedRecipe, type RecipeSSEData } from '@server/shared/types';
import { apiOrigin } from '@/config';
import { RecipeGenerationStatus } from '@server/shared/enums';
import axios from 'axios';
import useToast from '@/composables/useToast';
import { navigateToFridgeMode } from '@/router/utils';
import { getErrorMessage } from '@/composables/useErrorMessage/error';
import { assertValidFile } from '@/utils/assertValidFile';

export const useRecipeGeneratorStore = defineStore('recipeGenerator', () => {
  const isGenerating = ref(false);
  const recipes = ref<GeneratedRecipe[]>([]);
  const errorMessage = ref('');
  const eventSource = ref<EventSource | undefined>(undefined);

  const { showToast } = useToast();

  function closeEventSource() {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = undefined;
    }
  }

  function reset() {
    isGenerating.value = false;
    errorMessage.value = '';
    recipes.value = [];
    closeEventSource();
  }

  async function generateRecipes(fridgeImageFile: File) {
    try {
      assertValidFile(fridgeImageFile);
    } catch (error) {
      const message = (error as Error).message;
      errorMessage.value = message;
      showToast(message, 'error');
      return;
    }

    const { id: userId } = useUserStore();

    if (!userId) {
      const message = 'User not authenticated';
      errorMessage.value = message;
      showToast(message, 'error');
      return;
    }

    reset();
    isGenerating.value = true;

    const sseUrl = `${apiOrigin}/api/recipe/events`;
    eventSource.value = new EventSource(sseUrl, { withCredentials: true });

    eventSource.value.onmessage = (event) => {
      try {
        const data: RecipeSSEData = JSON.parse(event.data);

        if (data.status === RecipeGenerationStatus.ERROR) {
          errorMessage.value = data.message;
          showToast(errorMessage.value, 'error');
          isGenerating.value = false;
          closeEventSource();
        }

        if (data.status === RecipeGenerationStatus.SUCCESS) {
          recipes.value = data.recipes;
          isGenerating.value = false;
          closeEventSource();

          showToast(
            'Recipes have been Generated! Click here to see them',
            'success',
            {
              autoClose: 6000,
              onClick: async () => {
                await navigateToFridgeMode();
              },
            }
          );
        }
      } catch (error) {
        console.error('Error parsing SSE data', error);
        errorMessage.value = 'Received invalid data from server';
        isGenerating.value = false;
        closeEventSource();
      }
    };

    eventSource.value.onerror = (error) => {
      console.error('SSE Error:', error);
      if (
        isGenerating.value &&
        eventSource.value?.readyState === EventSource.CLOSED
      ) {
        const message = 'Connection lost. Please try again.';
        errorMessage.value = message;
        showToast(message, 'error');
        isGenerating.value = false;
      }
    };

    try {
      const formData = new FormData();
      formData.append('file', fridgeImageFile);
      const uploadEndpoint = `${apiOrigin}/api/recipe/generate`;

      await axios.post(uploadEndpoint, formData, { withCredentials: true });

      showToast(
        'Recipes are being generated. Meanwhile you can search for other recipes',
        'success'
      );
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
      isGenerating.value = false;
      closeEventSource();
    }
  }

  function clearRecipes() {
    recipes.value = [];
  }

  return {
    isGenerating,
    recipes,
    errorMessage,
    generateRecipes,
    reset,
    clearRecipes,
    showToast,
  };
});
