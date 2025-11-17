import { DEFAULT_SERVER_ERROR } from '@/consts';
import useErrorMessage from './useErrorMessage';
import { trpc } from '@/trpc';
import { ref } from 'vue';
import useToast from './useToast';

export function useSavedRecipeService(recipeId: number) {
  const { showLoading, updateToast } = useToast();
  const isSaved = ref(false);

  const [saveRecipe, saveErrorMessage] = useErrorMessage(
    async () => await trpc.savedRecipes.save.mutate(recipeId),
    true
  );

  async function handleSave() {
    const id = showLoading('Saving recipe...');

    try {
      await saveRecipe();
      isSaved.value = true;
      updateToast(id, 'success', 'Recipe saved successfully');
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
      isSaved.value = false;
      updateToast(id, 'success', 'Recipe unsaved successfully');
    } catch {
      updateToast(
        id,
        'error',
        unsaveErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  async function checkIfSaved() {
    isSaved.value = await trpc.savedRecipes.isSaved.query(recipeId);
  }

  return {
    isSaved,
    handleSave,
    handleUnsave,
    checkIfSaved,
  };
}
