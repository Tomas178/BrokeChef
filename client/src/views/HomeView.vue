<script setup lang="ts">
import RecipeCard from '@/components/RecipeCard.vue';
import { FwbDropdown, FwbPagination } from 'flowbite-vue';
import { trpc } from '@/trpc';
import type { PaginationWithSort } from '@server/shared/pagination';
import type { RecipesPublic } from '@server/shared/types';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SortingTypes } from '@server/shared/enums';

const route = useRoute();
const router = useRouter();

const recipes = ref<RecipesPublic[]>([]);

const totalCount = ref(0);

const totalPages = ref(1);
const currentPage = ref(1);

const pagination = reactive<PaginationWithSort>({
  offset: 0,
  limit: 36,
  sort: SortingTypes.NEWEST,
});

const sortOptions = [
  { label: 'Newest', value: SortingTypes.NEWEST },
  { label: 'Highest Rated', value: SortingTypes.HIGHEST_RATING },
  { label: 'Lowest Rated', value: SortingTypes.LOWEST_RATING },
  { label: 'Oldest', value: SortingTypes.OLDEST },
];

const selectedSort = computed(() => pagination.sort);

const fetchPage = async (page: number) => {
  currentPage.value = page;
  pagination.offset = (page - 1) * pagination.limit;

  const [fetchedRecipes] = await Promise.all([
    trpc.recipes.findAll.query(pagination),
    changeQueryParams(currentPage.value, pagination.sort),
  ]);

  recipes.value = fetchedRecipes;
};

const changeQueryParams = async (pageNumber: number, sort?: SortingTypes) => {
  await router.replace({
    query: {
      page: pageNumber.toString(),
      sort: sort ?? pagination.sort,
    },
  });
};

const isValidPage = (pageNumber: string | number): boolean => {
  const pageNumberConverted = Number(pageNumber);

  if (Number.isNaN(pageNumberConverted)) return false;

  return pageNumberConverted >= 1 && pageNumberConverted <= totalPages.value;
};

const getParamPage = async (): Promise<number> => {
  const rawPage = route.query.page;

  const rawPageString = Array.isArray(rawPage)
    ? (rawPage[0] ?? '')
    : (rawPage ?? '');

  const validPage = isValidPage(rawPageString);

  return validPage ? Number(rawPageString) : 1;
};

const onSortChange = async (newSort: SortingTypes) => {
  pagination.sort = newSort;
  await fetchPage(1);
};

onMounted(async () => {
  totalCount.value = await trpc.recipes.totalCount.query();
  totalPages.value = Math.ceil(totalCount.value / pagination.limit);

  const pageNumber = await getParamPage();

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
        :text="`Sort: ${sortOptions.find((o) => o.value === selectedSort)?.label ?? 'Newest'}`"
        placement="bottom"
        align-to-end
        close-inside
        class="mb-4 self-end"
      >
        <ul class="w-36 sm:w-48">
          <li
            v-for="option in sortOptions"
            :key="option.value"
            class="cursor-pointer px-4 py-2 font-bold hover:bg-gray-100"
            :class="[option.value === selectedSort ? 'bg-gray-400' : '']"
            @click="onSortChange(option.value)"
          >
            {{ option.label }}
          </li>
        </ul>
      </FwbDropdown>

      <div
        class="grid grid-cols-1 justify-center gap-4 md:grid-cols-2 md:gap-6 xl:gap-10 2xl:grid-cols-4"
      >
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>

      <FwbPagination
        v-model="currentPage"
        :total-items="totalCount"
        :per-page="pagination.limit"
        hide-labels
        show-icons
        enable-first-last
        @update:model-value="fetchPage(currentPage)"
        class="mt-10 flex justify-center [&_button]:cursor-pointer"
        large
      />
    </div>
  </div>
</template>
