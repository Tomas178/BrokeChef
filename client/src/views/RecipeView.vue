<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import { titleCase } from 'title-case';
import { format } from 'date-fns';
import RecipeDetailsCard from '@/components/RecipeDetailsCard.vue';
import Spinner from '@/components/Spinner.vue';
import Dialog from '@/components/Dialog.vue';
import { formatRecipeRating } from '@/utils/formatRecipeRating';
import { useRecipesService } from '@/composables/useRecipesService';
import { useSavedRecipeService } from '@/composables/useSavedRecipesService';
import { ROUTE_NAMES } from '@/router/consts/routeNames';
import { useCookedRecipesService } from '@/composables/useCookedRecipesService';
import { useRatingsService } from '@/composables/useRatingsService';
import { FwbDropdown } from 'flowbite-vue';
import { useCollectionsService } from '@/composables/useCollectionsService';
import { useCollectionsRecipesService } from '@/composables/useCollectionsRecipesService';

const route = useRoute();

const isLoading = ref(true);
const recipeId = Number(route.params.id);
const dialogRef = ref<InstanceType<typeof Dialog> | null>(null);

function showDialog() {
  dialogRef.value?.open();
}

const { recipe, isAuthor, getRecipe, checkIsAuthor, handleDelete } =
  useRecipesService(recipeId);

const { isSaved, handleSave, handleUnsave, checkIfSaved } =
  useSavedRecipeService(recipeId);

const { isCooked, handleMarkAsCooked, handleUnmarkAsCooked, checkIfCooked } =
  useCookedRecipesService(recipeId);

const { userCollections, fetchUserCollections } = useCollectionsService();

const { handleSaveToCollection } = useCollectionsRecipesService(recipeId);

const {
  hoveredRating,
  userRating,
  handleCreateRating,
  handleUpdateRating,
  handleRemoveRating,
  getUserRating,
} = useRatingsService(recipeId, recipe);

onBeforeMount(async () => {
  await Promise.all([
    getRecipe(),
    checkIsAuthor(),
    checkIfSaved(),
    getUserRating(),
    checkIfCooked(),
  ]);
});
</script>

<template>
  <div v-if="recipe">
    <div
      class="flex flex-col gap-8 md:gap-10 lg:mx-4 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-2"
    >
      <div class="w-full lg:col-span-1">
        <div class="flex h-64 w-full items-center justify-center lg:h-136">
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
        class="mx-4 flex flex-col justify-between gap-4 md:mx-16 lg:col-span-1 lg:mt-4 lg:mr-28 lg:mb-4 lg:ml-4"
      >
        <div class="flex flex-col">
          <span
            class="text-submit-text justify-center text-3xl font-bold text-wrap break-words lg:text-6xl"
            >{{ titleCase(recipe.title.toLowerCase()) }}
          </span>

          <div class="flex flex-col md:text-xl lg:text-2xl">
            <div class="justify-center leading-loose text-gray-500">
              <RouterLink
                data-testid="author"
                class="text-primary-green hover:text-secondary-green"
                :to="{
                  name: ROUTE_NAMES.USER_PROFILE,
                  params: { id: recipe.userId },
                }"
              >
                {{ recipe.author.name }}
              </RouterLink>

              <span data-testid="created-at" class="">
                • {{ format(recipe.createdAt, 'd MMM yyyy') }}
              </span>
            </div>
            <div
              data-testid="duration"
              class="justify-center leading-loose text-gray-500"
            >
              <span>Cooking duration {{ recipe.duration }} minutes</span>
            </div>
            <div
              :class="{
                'flex gap-4': !isAuthor,
                flex: isAuthor,
              }"
            >
              <div>
                <button
                  v-if="!isAuthor && !isCooked"
                  @click="handleMarkAsCooked"
                  type="button"
                  data-testid="mark-cooked-button"
                  title="Mark as Cooked"
                  class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-500/90 transition-transform hover:scale-110 hover:bg-green-600/90 dark:bg-green-600/90 dark:hover:bg-green-700/90"
                >
                  <span class="material-symbols-outlined"> fork_spoon </span>
                </button>

                <button
                  v-if="!isAuthor && isCooked"
                  @click="handleUnmarkAsCooked"
                  type="button"
                  data-testid="unmark-cooked-button"
                  title="Unmark as Cooked"
                  class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-500/90 transition-transform hover:scale-110 hover:bg-gray-600/90 dark:bg-gray-600/90 dark:hover:bg-gray-700/90"
                >
                  <span class="material-symbols-outlined"> no_meals </span>
                </button>
              </div>
              <div>
                <FwbDropdown
                  color="light"
                  text="Add to Collection"
                  placement="bottom"
                  close-inside
                  triggerClass="cursor-pointer dark:hover:text-black"
                  @show="fetchUserCollections"
                >
                  <ul
                    class="dark:bg-background-recipe-card-dark flex max-h-96 w-36 flex-col gap-3 overflow-y-auto pr-2 sm:w-48"
                  >
                    <li
                      v-for="collection in userCollections"
                      :key="collection.id"
                      class="flex cursor-pointer items-center justify-between hover:bg-green-100"
                      @click="handleSaveToCollection(collection.id)"
                    >
                      <div
                        :data-testid="`follow-modal-user-${collection.id}`"
                        class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-300"
                      >
                        <img
                          v-if="collection.imageUrl"
                          data-testid="follow-modal-user-image"
                          :src="collection.imageUrl"
                          :alt="collection.title"
                          class="h-full w-full object-cover"
                        />
                        <div
                          v-else
                          data-testid="follow-modal-user-image-fallback"
                          class="flex h-full w-full items-center justify-center text-xs text-gray-600"
                        >
                          {{ collection.title.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                      <span
                        data-testid="follow-modal-user-username"
                        class="text-base font-medium"
                        >{{ collection.title }}</span
                      >
                    </li>
                  </ul>
                </FwbDropdown>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex flex-wrap justify-between gap-4 sm:flex-nowrap md:gap-6"
        >
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
                  v-if="recipe.rating > 0"
                  class="font-bold tracking-wider text-yellow-400"
                >
                  {{ formatRecipeRating(recipe.rating) }}/5
                </span>
                <span
                  data-testid="not-rated-author-text"
                  v-else-if="isAuthor"
                  class="text-primary-green"
                >
                  No Ratings yet!
                </span>
                <span
                  data-testid="average-rating"
                  v-else
                  class="font-bold tracking-wider text-yellow-400"
                >
                  {{ formatRecipeRating(recipe.rating) }}/5
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
                  !isAuthor &&
                  (userRating
                    ? handleUpdateRating(star)
                    : handleCreateRating(star))
                "
                @mouseenter="!isAuthor && (hoveredRating = star)"
                @mouseleave="!isAuthor && (hoveredRating = 0)"
                :class="{
                  'cursor-pointer transition-transform hover:scale-110':
                    !isAuthor,
                  'cursor-default': isAuthor,
                }"
              >
                <svg
                  class="h-6 w-6 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                  :class="{
                    'fill-rating': star <= (hoveredRating || userRating || 0),
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
              class="cursor-pointer rounded-3xl bg-red-400/90 px-6 py-2 text-xl leading-tight font-medium text-white hover:outline-1 hover:outline-black dark:hover:outline-white"
            >
              Delete
            </button>

            <button
              v-else-if="!isSaved"
              @click="handleSave"
              type="button"
              class="gradient-action-button cursor-pointer rounded-3xl px-6 py-2 text-xl leading-tight font-medium text-white hover:outline-1 hover:outline-black dark:hover:outline-white"
            >
              Save
            </button>

            <button
              v-else
              @click="handleUnsave"
              type="button"
              class="gradient-action-button cursor-pointer rounded-3xl px-6 py-2 text-xl leading-tight font-medium text-white hover:outline-1 hover:outline-black dark:hover:outline-white"
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
              class="rounded-3xl bg-white/10 px-8 py-6 leading-loose shadow-xl backdrop-blur-lg dark:text-white"
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
