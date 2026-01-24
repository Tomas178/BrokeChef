<script setup lang="ts">
import RecipeCard from '@/components/RecipeCard.vue';
import { FwbDropdown, FwbPagination, FwbInput } from 'flowbite-vue';
import { trpc } from '@/trpc';
import type { PaginationWithSort } from '@server/shared/pagination';
import type {
  PaginationWithUserInput,
  RecipesPublic,
} from '@server/shared/types';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SortingTypes, type SortingTypesValues } from '@server/shared/enums';
import Spinner from '@/components/Spinner.vue';
import { RECIPE_CARD_VARIANT } from '@/types/recipeCard';
import useErrorMessage from '@/composables/useErrorMessage';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { watchEffect } from 'vue';

const route = useRoute();
const router = useRouter();
const { isLoggedIn } = storeToRefs(useUserStore());

const RECIPES_PER_PAGE = 5;

const recipes = ref<RecipesPublic[]>([]);
const totalCount = ref(0);
const isLoading = ref(false);
const searchQuery = ref('');

const isRecipes = computed(() => recipes.value.length > 0);
const errorMessage = 'Failed to load recipes. Please try again.';

const totalPages = computed(() =>
  Math.ceil(totalCount.value / RECIPES_PER_PAGE)
);
const currentPage = ref(1);

const pagination = reactive<PaginationWithSort>({
  offset: 0,
  limit: RECIPES_PER_PAGE,
  sort: SortingTypes.NEWEST,
});

const baseSortOptions = [
  { label: 'Newest', value: SortingTypes.NEWEST },
  { label: 'Highest Rated', value: SortingTypes.HIGHEST_RATING },
  { label: 'Lowest Rated', value: SortingTypes.LOWEST_RATING },
  { label: 'Oldest', value: SortingTypes.OLDEST },
] as const;

const authSortOptions = [
  ...baseSortOptions,
  { label: 'Recommended', value: SortingTypes.RECOMMENDED },
] as const;

const sortOptions = computed(() =>
  isLoggedIn.value ? authSortOptions : baseSortOptions
);

const selectedSortLabel = computed(
  () =>
    sortOptions.value.find((o) => o.value === pagination.sort)?.label ??
    'Newest'
);

watchEffect(() => {
  if (!isLoggedIn.value && pagination.sort === SortingTypes.RECOMMENDED) {
    onSortChange(SortingTypes.NEWEST);
  }
});

const [searchRecipes, searchRecipesErrorMessage] = useErrorMessage<
  [PaginationWithUserInput],
  ReturnType<typeof trpc.recipes.search.query>,
  typeof trpc.recipes.search.query
>(async (input) => await trpc.recipes.search.query(input), true);

const fetchPage = async (page: number) => {
  isLoading.value = true;

  try {
    currentPage.value = page;
    const offset = (page - 1) * RECIPES_PER_PAGE;

    await updateQueryParams(page, pagination.sort, searchQuery.value);

    let fetchedRecipes: RecipesPublic[] = [];

    if (searchQuery.value.trim()) {
      fetchedRecipes = await searchRecipes({
        userInput: searchQuery.value,
        offset,
        limit: RECIPES_PER_PAGE,
      });
    } else if (pagination.sort === SortingTypes.RECOMMENDED) {
      if (isLoggedIn.value) {
        fetchedRecipes = await trpc.recipes.findAllRecommended.query({
          offset,
          limit: RECIPES_PER_PAGE,
        });
      } else {
        fetchedRecipes = await trpc.recipes.findAll.query({
          ...pagination,
          sort: SortingTypes.NEWEST,
        });
      }
    } else {
      pagination.offset = offset;
      fetchedRecipes = await trpc.recipes.findAll.query(pagination);
    }

    recipes.value = fetchedRecipes;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = async () => {
  await fetchPage(1);
};

const clearSearch = async () => {
  searchQuery.value = '';
  searchRecipesErrorMessage.value = '';
  await fetchPage(1);
};

const updateQueryParams = async (
  pageNumber: number,
  sort?: SortingTypesValues,
  search?: string
) => {
  const newQuery: Record<string, string | undefined> = {
    page: pageNumber.toString(),
    sort,
  };

  if (search) {
    newQuery.search = search;
  }

  await router.replace({ query: newQuery });
};

const isValidPage = (pageNumber: string | number): boolean => {
  const pageNumberConverted = Number(pageNumber);

  if (Number.isNaN(pageNumberConverted)) return false;

  return pageNumberConverted >= 1 && pageNumberConverted <= totalPages.value;
};

const getPageFromRoute = (): number => {
  const rawPage = route.query.page;
  const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  return pageStr && isValidPage(pageStr) ? Number(pageStr) : 1;
};

const getSortFromRoute = (): SortingTypesValues => {
  const rawSort = route.query.sort;
  const sortStr = Array.isArray(rawSort) ? rawSort[0] : rawSort;

  return authSortOptions.some((o) => o.value === sortStr)
    ? (sortStr as SortingTypesValues)
    : SortingTypes.NEWEST;
};

const getSearchFromRoute = (): string => {
  const rawSearch = route.query.search;
  return (Array.isArray(rawSearch) ? rawSearch[0] : rawSearch) || '';
};

const onSortChange = async (newSort: SortingTypesValues) => {
  if (pagination.sort === newSort) return;
  clearSearch();

  pagination.sort = newSort;
  await fetchPage(1);
};

onMounted(async () => {
  totalCount.value = await trpc.recipes.totalCount.query();

  const pageNumber = getPageFromRoute();
  const sort = getSortFromRoute();
  const search = getSearchFromRoute();

  pagination.sort = sort;
  searchQuery.value = search;

  await fetchPage(pageNumber);
});
</script>

<template>
  <div class="m-4 flex flex-col gap-10 lg:mx-32 lg:my-8 lg:gap-13">
    <div
      class="flex flex-col items-center justify-center gap-4 lg:mx-20 lg:gap-6"
    >
      <div class="flex flex-col text-center text-3xl font-bold lg:text-6xl">
        <span class="text-primary-green">Explore Simple &</span>
        <span class="text-header-light">Tasty Recipes</span>
      </div>
      <span class="text-center font-medium text-wrap lg:mx-9 dark:text-white">
        Dive into our recipes, where every dish is a memory in the making. Come,
        cook, and create with us!
      </span>

      <div class="mt-4">
        <FwbInput
          v-model="searchQuery"
          placeholder="What would you like to cook? (e.g., 'Spicy pasta')"
          @keydown.enter="handleSearch"
        >
          <template #suffix>
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="material-symbols-outlined mr-2 cursor-pointer text-red-500 hover:text-red-700"
            >
              Close
            </button>
            <button
              type="button"
              @click="handleSearch"
              :disabled="isLoading"
              class="material-symbols-outlined cursor-pointer hover:text-gray-300"
            >
              Search
            </button>
          </template>
        </FwbInput>
        <p
          v-if="searchRecipesErrorMessage"
          class="mt-2 text-center text-sm text-red-500"
        >
          {{ searchRecipesErrorMessage }}
        </p>
        <p
          v-else-if="searchQuery"
          class="dark:text-primary-green mt-2 text-center text-sm text-gray-500"
        >
          Using Semantic Search. Sorting by relevance.
        </p>
      </div>
    </div>

    <div class="flex flex-col">
      <FwbDropdown
        color="light"
        :text="`Sort: ${selectedSortLabel}`"
        placement="bottom"
        triggerClass="cursor-pointer dark:hover:text-black"
        align-to-end
        close-inside
        class="mb-4 self-end text-gray-800 hover:bg-inherit dark:text-gray-100 dark:hover:text-black"
        :disabled="isLoading || !isRecipes"
      >
        <ul class="w-36 bg-white sm:w-48 dark:bg-gray-900">
          <li
            v-for="option in sortOptions"
            :key="option.value"
            class="cursor-pointer px-4 py-2 font-bold text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
            :class="[
              option.value === pagination.sort
                ? 'bg-gray-200 dark:bg-gray-800'
                : '',
            ]"
            @click="onSortChange(option.value)"
          >
            {{ option.label }}
          </li>
        </ul>
      </FwbDropdown>

      <!-- Loading state -->
      <Spinner class="self-center" v-if="isLoading" />

      <!-- Non-empty state -->
      <div
        v-else-if="isRecipes"
        class="grid grid-cols-1 justify-center gap-4 md:grid-cols-2 md:gap-6 xl:gap-10 2xl:grid-cols-3"
      >
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
          :variant="RECIPE_CARD_VARIANT.HOMEPAGE"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex items-center justify-center py-20">
        <span class="text-center text-gray-600">{{ errorMessage }}</span>
      </div>

      <FwbPagination
        v-model="currentPage"
        :total-items="totalCount"
        :per-page="RECIPES_PER_PAGE"
        hide-labels
        show-icons
        enable-first-last
        @update:model-value="fetchPage(currentPage)"
        class="mt-10 flex justify-center [&_button]:cursor-pointer"
        large
        :disabled="isLoading || !isRecipes"
      />
    </div>
  </div>
</template>
