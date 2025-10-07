<script setup lang="ts">
import RecipeCard from '@/components/RecipeCard.vue';
import { FwbDropdown, FwbPagination } from 'flowbite-vue';
import { trpc } from '@/trpc';
import type { PaginationWithSort } from '@server/shared/pagination';
import type { RecipesPublic } from '@server/shared/types';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SortingTypes } from '@server/shared/enums';
import Spinner from '@/components/Spinner.vue';

const route = useRoute();
const router = useRouter();

const RECIPES_PER_PAGE = 3;

const recipes = ref<RecipesPublic[]>([]);
const totalCount = ref(0);
const isLoading = ref(false);
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

const sortOptions = [
  { label: 'Newest', value: SortingTypes.NEWEST },
  { label: 'Highest Rated', value: SortingTypes.HIGHEST_RATING },
  { label: 'Lowest Rated', value: SortingTypes.LOWEST_RATING },
  { label: 'Oldest', value: SortingTypes.OLDEST },
] as const;

const selectedSortLabel = computed(
  () => sortOptions.find((o) => o.value === pagination.sort)?.label ?? 'Newest'
);

const fetchPage = async (page: number) => {
  isLoading.value = true;

  try {
    currentPage.value = page;
    pagination.offset = (page - 1) * RECIPES_PER_PAGE;

    const [fetchedRecipes] = await Promise.all([
      trpc.recipes.findAll.query(pagination),
      updateQueryParams(page, pagination.sort),
    ]);

    recipes.value = fetchedRecipes;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    isLoading.value = false;
  } finally {
    isLoading.value = false;
  }
};

const updateQueryParams = async (pageNumber: number, sort?: SortingTypes) => {
  const newQuery = { page: pageNumber.toString(), sort };

  if (
    route.query.page !== newQuery.page ||
    route.query.sort !== newQuery.sort
  ) {
    await router.replace({ query: newQuery });
  }
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

const getSortFromRoute = (): SortingTypes => {
  const rawSort = route.query.sort;
  const sortStr = Array.isArray(rawSort) ? rawSort[0] : rawSort;
  return sortOptions.some((o) => o.value === sortStr)
    ? (sortStr as SortingTypes)
    : SortingTypes.NEWEST;
};

const onSortChange = async (newSort: SortingTypes) => {
  if (pagination.sort === newSort) return;

  pagination.sort = newSort;
  await fetchPage(1);
};

onMounted(async () => {
  totalCount.value = await trpc.recipes.totalCount.query();

  const pageNumber = getPageFromRoute();
  const sort = getSortFromRoute();

  pagination.sort = sort;

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
        <span class="text-header">Tasty Recipes</span>
      </div>
      <span class="text-center font-medium text-wrap lg:mx-9">
        Dive into our recipes, where every dish is a memory in the making. Come,
        cook, and create with us!
      </span>
    </div>
    <div class="flex flex-col">
      <FwbDropdown
        color="light"
        :text="`Sort: ${selectedSortLabel}`"
        placement="bottom"
        align-to-end
        close-inside
        class="mb-4 self-end"
        :disabled="isLoading || !isRecipes"
      >
        <ul class="w-36 sm:w-48">
          <li
            v-for="option in sortOptions"
            :key="option.value"
            class="cursor-pointer px-4 py-2 font-bold transition-colors hover:bg-gray-100"
            :class="[option.value === pagination.sort ? 'bg-gray-200' : '']"
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
        class="grid grid-cols-1 justify-center gap-4 md:grid-cols-2 md:gap-6 xl:gap-10 2xl:grid-cols-4"
      >
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
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
