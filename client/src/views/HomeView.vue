<script setup lang="ts">
import RecipeCard from '@/components/RecipeCard.vue';
import { FwbPagination } from 'flowbite-vue';
import { trpc } from '@/trpc';
import type { Pagination } from '@server/shared/pagination';
import type { RecipesPublic } from '@server/shared/types';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const recipes = ref<RecipesPublic[]>([]);

const limit = 36;

const totalCount = ref(0);

const totalPages = ref(1);
const currentPage = ref(1);

const pagination = reactive<Pagination>({
  offset: 0,
  limit,
});

const fetchPage = async (page: number) => {
  currentPage.value = page;
  pagination.offset = (page - 1) * limit;

  const [fetchedRecipes] = await Promise.all([
    trpc.recipes.findAll.query(pagination),
    changeQueryParams(currentPage.value),
  ]);

  recipes.value = fetchedRecipes;
};

const changeQueryParams = async (pageNumber: number) => {
  await router.replace({ query: { page: pageNumber.toString() } });
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

onMounted(async () => {
  totalCount.value = await trpc.recipes.totalCount.query();
  totalPages.value = Math.ceil(totalCount.value / limit);

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
      <div
        class="grid grid-cols-1 justify-center gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 xl:gap-10"
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
        :per-page="limit"
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
