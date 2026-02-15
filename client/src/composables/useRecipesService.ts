import { DEFAULT_SERVER_ERROR } from '@/consts';
import useErrorMessage from './useErrorMessage';
import useToast from './useToast';
import { trpc } from '@/trpc';
import { navigateToHome, navigateToRecipe } from '@/router/utils';
import { computed, reactive, ref } from 'vue';
import type {
  CreateRecipeInput,
  RecipesPublic,
  RecipesPublicAllInfo,
} from '@server/shared/types';
import { apiOrigin } from '@/config';
import axios from 'axios';
import { assertValidFile } from '@/utils/assertValidFile';

export function useRecipesService(recipeId?: number) {
  const { showLoading, updateToast } = useToast();

  const recipe = ref<RecipesPublicAllInfo>();
  const isAuthor = ref(false);

  const recipeForm = reactive<CreateRecipeInput>({
    title: '',
    duration: 0,
    imageUrl: undefined,
    steps: [''],
    ingredients: [''],
    tools: [''],
  });

  const recipeImageFile = ref<File | undefined>(undefined);

  const durationString = computed({
    get: () => recipeForm.duration.toString(),
    set: (val: string) => {
      const parsed = parseInt(val);
      recipeForm.duration = isNaN(parsed) ? 0 : parsed;
    },
  });

  const uploadEndpoint = `${apiOrigin}/api/upload/recipe`;

  async function getRecipe() {
    if (!recipeId) return;
    recipe.value = await trpc.recipes.findById.query({ id: recipeId });
  }

  async function checkIsAuthor() {
    if (!recipeId) return;
    isAuthor.value = await trpc.recipes.isAuthor.query({ id: recipeId });
  }

  async function uploadRecipeImage(): Promise<string | undefined> {
    if (!recipeImageFile.value) {
      return undefined;
    }

    assertValidFile(recipeImageFile.value);

    const formData = new FormData();
    formData.append('file', recipeImageFile.value);

    const { data } = await axios.post<Pick<RecipesPublic, 'imageUrl'>>(
      uploadEndpoint,
      formData,
      {
        withCredentials: true,
      }
    );

    return data.imageUrl;
  }

  function resetForm() {
    recipeForm.title = '';
    recipeForm.duration = 0;
    recipeForm.steps = [''];
    recipeForm.ingredients = [''];
    recipeForm.tools = [''];
    recipeForm.imageUrl = '';
    recipeImageFile.value = undefined;
  }

  const [createRecipe, createErrorMessage] = useErrorMessage(async () => {
    recipeForm.imageUrl = await uploadRecipeImage();
    return trpc.recipes.create.mutate(recipeForm);
  }, true);

  async function handleCreateRecipe() {
    const id = showLoading('Creating recipe...');

    try {
      const newRecipe = await createRecipe();

      if (!newRecipe) {
        updateToast(
          id,
          'error',
          createErrorMessage.value || DEFAULT_SERVER_ERROR
        );
        return;
      }

      updateToast(id, 'success', 'Recipe has been created!');
      resetForm();
      await navigateToRecipe({ id: newRecipe.id }, 1500);
    } catch {
      updateToast(
        id,
        'error',
        createErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  const [deleteRecipe, deleteErrorMessage] = useErrorMessage(async () => {
    if (!recipeId) throw new Error('Recipe ID is required');
    return await trpc.recipes.remove.mutate({ id: recipeId });
  }, true);

  async function handleDelete() {
    const id = showLoading('Removing Recipe...');

    try {
      await deleteRecipe();
      updateToast(id, 'success', 'Recipe Removed!');
      await navigateToHome(undefined, 1000);
    } catch {
      updateToast(
        id,
        'error',
        deleteErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  return {
    // View/Edit recipe
    recipe,
    isAuthor,
    getRecipe,
    checkIsAuthor,
    handleDelete,

    // Create recipe
    recipeForm,
    recipeImageFile,
    durationString,
    handleCreateRecipe,
  };
}
