import { trpc } from '@/trpc';
import useErrorMessage from './useErrorMessage';
import useToast from './useToast';
import { DEFAULT_SERVER_ERROR } from '@/consts';

export function useCollectionsRecipesService(recipeId: number) {
  const { showLoading, updateToast } = useToast();

  const [saveToCollection, saveToCollectionErrorMessage] = useErrorMessage(
    (async (...args: unknown[]) => {
      const collectionId = args[0] as number;

      return await trpc.collectionsRecipes.save.mutate({
        collectionId,
        recipeId,
      });
    }) as (...args: unknown[]) => unknown,
    true
  );

  async function handleSaveToCollection(collectionId: number) {
    const id = showLoading('Saving Recipe to Collection...');

    try {
      await saveToCollection(collectionId);

      updateToast(id, 'success', 'Recipe saved to collection successfully');
    } catch {
      updateToast(
        id,
        'error',
        saveToCollectionErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  return {
    handleSaveToCollection,
  };
}
