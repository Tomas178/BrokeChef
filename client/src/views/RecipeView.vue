<script lang="ts" setup>
import { trpc } from '@/trpc';
import { useRoute, useRouter } from 'vue-router';
import type {
  CreateRatingInput,
  Rating,
  RecipesPublicAllInfo,
} from '@server/shared/types';
import { onBeforeMount, ref } from 'vue';
import { titleCase } from 'title-case';
import { format } from 'date-fns';
import useErrorMessage from '@/composables/useErrorMessage';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import RecipeDetailsCard from '@/components/RecipeDetailsCard.vue';
import Spinner from '@/components/Spinner.vue';
import useToast from '@/composables/useToast';
import Dialog from '@/components/Dialog.vue';
import { formatRecipeRating } from '@/utils/formatRecipeRating';

const { showLoading, updateToast } = useToast();

const route = useRoute();
const router = useRouter();

const recipe = ref<RecipesPublicAllInfo>();
const isAuthor = ref(false);
const isSaved = ref(false);

const isLoading = ref(true);

const recipeId = Number(route.params.id);

const dialogRef = ref<InstanceType<typeof Dialog> | null>(null);

function showDialog() {
  dialogRef.value?.open();
}

const [deleteRecipe, deleteErrorMessage] = useErrorMessage(
  async () => await trpc.recipes.remove.mutate(recipeId),
  true
);

async function handleDelete() {
  const id = showLoading('Removing Recipe...');

  try {
    await deleteRecipe();

    updateToast(id, 'success', 'Recipe Removed!');

    setTimeout(async () => {
      await router.push({
        name: 'Home',
      });
    }, 1000);
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
    updateToast(id, 'error', unsaveErrorMessage.value || DEFAULT_SERVER_ERROR);
  }
}

const hoveredRating = ref(0);
const userRating = ref<Rating>(undefined);

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
  async () => await trpc.ratings.remove.mutate(recipeId),
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

onBeforeMount(async () => {
  [recipe.value, isAuthor.value, isSaved.value, userRating.value] =
    await Promise.all([
      trpc.recipes.findById.query(recipeId),
      trpc.recipes.isAuthor.query(recipeId),
      trpc.savedRecipes.isSaved.query(recipeId),
      trpc.ratings.getUserRatingForRecipe.query(recipeId),
    ]);
});
</script>

<template>
  <div v-if="recipe">
    <div
      class="flex flex-col gap-8 md:gap-10 lg:mx-4 lg:grid lg:grid-cols-9 lg:gap-2"
    >
      <div class="relative w-full lg:col-span-5">
        <div class="flex h-64 w-full items-center justify-center lg:h-104">
          <Spinner v-show="isLoading" />
          <img
            data-testid="image"
            v-show="!isLoading"
            :src="recipe.imageUrl"
            :alt="recipe.title"
            class="h-full w-full rounded-2xl object-cover"
            @load="isLoading = false"
          />
        </div>
      </div>

      <div
        class="mx-4 flex flex-col justify-between gap-4 md:mx-16 lg:col-span-4 lg:mt-4 lg:mr-28 lg:mb-4 lg:ml-4"
      >
        <div class="flex flex-col">
          <div class="justify-center">
            <span
              class="text-submit-text text-3xl font-bold text-wrap break-words lg:text-6xl"
              >{{ titleCase(recipe.title.toLowerCase()) }}
            </span>
          </div>
          <div class="flex flex-col md:text-xl lg:text-2xl">
            <div class="justify-center leading-loose text-gray-500">
              <span
                data-testid="author"
                class="text-primary-green hover:text-secondary-green"
              >
                <RouterLink
                  :to="{ name: 'UserProfile', params: { id: recipe.userId } }"
                >
                  {{ recipe.author.name }}
                </RouterLink>
              </span>
              <span data-testid="created-at" class="">
                • {{ format(recipe.createdAt, 'd MMM yyyy') }}
              </span>
            </div>
            <div
              data-testid="duration"
              class="justify-center leading-loose text-gray-500"
            >
              <span>Cook duration {{ recipe.duration }} minutes</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap justify-between gap-4 md:gap-6">
          <div class="mt-auto flex flex-col self-start">
            <div class="flex justify-between gap-2 text-gray-500 lg:text-xl">
              <div class="flex items-center justify-between">
                <button
                  data-testid="remove-rating"
                  v-if="userRating"
                  type="button"
                  @click="handleRemoveRating"
                  class="cursor-pointer text-sm text-gray-400 transition-colors hover:text-red-400 md:text-base"
                >
                  Remove
                </button>
              </div>
              <div>
                <span
                  data-testid="average-rating"
                  v-if="recipe.rating"
                  class="font-bold tracking-wider text-yellow-400"
                >
                  {{ formatRecipeRating(recipe.rating) }}/5
                </span>
                <span
                  data-testid="not-rated-text"
                  v-else
                  class="text-primary-green"
                >
                  Be the first one to Rate!
                </span>
              </div>
            </div>

            <div
              data-testid="star-rating"
              class="flex items-center justify-center gap-1 lg:justify-start"
            >
              <button
                v-for="star in 5"
                :key="star"
                :data-testid="`star-${star}`"
                type="button"
                @click="
                  userRating
                    ? handleUpdateRating(star)
                    : handleCreateRating(star)
                "
                @mouseenter="hoveredRating = star"
                @mouseleave="hoveredRating = 0"
                class="cursor-pointer transition-transform hover:scale-110"
              >
                <svg
                  class="h-6 w-6 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                  :class="{
                    'fill-yellow-400':
                      star <= (hoveredRating || userRating || 0),
                    'fill-gray-300': star > (hoveredRating || userRating || 0),
                  }"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-auto self-end">
            <button
              v-if="isAuthor"
              @click="showDialog"
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

        <Dialog
          ref="dialogRef"
          description="Are you sure you want to delete this recipe? This action cannot be undone."
          action-name="Delete"
          @confirm="handleDelete"
        />
      </div>
    </div>

    <div class="mx-4 mt-8 mb-12 md:mx-16 md:mt-10 md:mb-14 lg:mx-32">
      <div class="flex flex-col gap-20">
        <div class="flex flex-col gap-10">
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
            data-testid="Steps"
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
