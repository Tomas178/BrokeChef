import { DEFAULT_SERVER_ERROR } from '@/consts';
import useErrorMessage from './useErrorMessage';
import { trpc } from '@/trpc';
import { ref } from 'vue';
import useToast from './useToast';

export function useCookedRecipesService(recipeId: number) {
  const { showLoading, updateToast } = useToast();
  const isCooked = ref(false);

  const [markAsCooked, markCookedErrorMessage] = useErrorMessage(
    async () => await trpc.cookedRecipes.mark.mutate(recipeId),
    true
  );

  async function handleMarkAsCooked() {
    const id = showLoading('Marking as cooked...');

    try {
      await markAsCooked();
      isCooked.value = true;
      updateToast(id, 'success', 'Recipe marked as cooked!');
    } catch {
      updateToast(
        id,
        'error',
        markCookedErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  const [unmarkAsCooked, unmarkCookedErrorMessage] = useErrorMessage(
    async () => await trpc.cookedRecipes.unmark.mutate(recipeId),
    true
  );

  async function handleUnmarkAsCooked() {
    const id = showLoading('Unmarking as cooked...');

    try {
      await unmarkAsCooked();
      isCooked.value = false;
      updateToast(id, 'success', 'Recipe unmarked as cooked');
    } catch {
      updateToast(
        id,
        'error',
        unmarkCookedErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  async function checkIfCooked() {
    isCooked.value = await trpc.cookedRecipes.isMarked.query(recipeId);
  }

  return {
    isCooked,
    handleMarkAsCooked,
    handleUnmarkAsCooked,
    checkIfCooked,
  };
}
