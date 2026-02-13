import { DEFAULT_SERVER_ERROR } from '@/consts';
import { trpc } from '@/trpc';
import useErrorMessage from './useErrorMessage';
import type {
  CreateRatingInput,
  RecipesPublicAllInfo,
} from '@server/shared/types';
import useToast from './useToast';
import { ref, type Ref } from 'vue';

export function useRatingsService(
  recipeId: number,
  recipe: Ref<RecipesPublicAllInfo | undefined>
) {
  const { showLoading, updateToast } = useToast();
  const hoveredRating = ref(0);
  const userRating = ref<number | undefined>(undefined);

  const [rateRecipe, rateErrorMessage] = useErrorMessage<
    [CreateRatingInput],
    ReturnType<typeof trpc.ratings.rate.mutate>,
    typeof trpc.ratings.rate.mutate
  >(
    async (fullRating: CreateRatingInput) =>
      await trpc.ratings.rate.mutate(fullRating),
    true
  );

  async function handleCreateRating(rating: number) {
    const id = showLoading('Saving rating...');

    try {
      const ratingData: CreateRatingInput = { rating, recipeId };
      const createdRating = await rateRecipe(ratingData);

      if (recipe.value) {
        recipe.value.rating = createdRating?.rating;
      }

      userRating.value = rating;
      updateToast(id, 'success', 'Rating saved successfully');
    } catch {
      updateToast(id, 'error', rateErrorMessage.value || DEFAULT_SERVER_ERROR);
    }
  }

  const [updateRating, updateRatingErrorMessage] = useErrorMessage<
    [CreateRatingInput],
    ReturnType<typeof trpc.ratings.update.mutate>,
    typeof trpc.ratings.update.mutate
  >(
    async (fullRating: CreateRatingInput) =>
      await trpc.ratings.update.mutate(fullRating),
    true
  );

  async function handleUpdateRating(rating: number) {
    const id = showLoading('Updating rating...');

    try {
      const ratingData: CreateRatingInput = { rating, recipeId };
      const updatedRating = await updateRating(ratingData);

      if (recipe.value) {
        recipe.value.rating = updatedRating;
      }

      userRating.value = rating;
      updateToast(id, 'success', 'Rating updated successfully');
    } catch {
      updateToast(
        id,
        'error',
        updateRatingErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  const [removeRating, removeRatingErrorMessage] = useErrorMessage(
    async () => await trpc.ratings.remove.mutate({ id: recipeId }),
    true
  );

  async function handleRemoveRating() {
    const id = showLoading('Removing your rating...');

    try {
      const ratingAfterRemoval = await removeRating();

      if (recipe.value) {
        recipe.value.rating = ratingAfterRemoval;
      }

      userRating.value = undefined;
      updateToast(id, 'success', 'Rating removed successfully');
    } catch {
      updateToast(
        id,
        'error',
        removeRatingErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  async function getUserRating() {
    userRating.value = await trpc.ratings.getUserRatingForRecipe.query({
      id: recipeId,
    });
  }

  return {
    hoveredRating,
    userRating,
    handleCreateRating,
    handleUpdateRating,
    handleRemoveRating,
    getUserRating,
  };
}
