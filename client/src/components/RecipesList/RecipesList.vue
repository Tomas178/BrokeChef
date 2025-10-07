<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import RecipeCard from '@/components/RecipeCard.vue';
import Spinner from '@/components/Spinner.vue';
import NavButton from './NavButton.vue';
import NoRecipes from '@/components/RecipesList/NoRecipes.vue';
import { RECIPE_TYPE, type RecipeTypeValues } from './types';
import { trpc } from '@/trpc';
import type { RecipesPublic } from '@server/shared/types';
import type { Pagination } from '@server/shared/pagination';

const { title, recipeType, userId } = defineProps<{
  title: string;
  recipeType: RecipeTypeValues;
  userId: string | undefined;
}>();

const isLoading = ref(true);

const totalRecipes = ref(0);

const pagination = reactive<Pagination>({
  offset: 0,
  limit: 4,
});

const recipes = ref<RecipesPublic[]>([]);

const hasPrev = computed(() => pagination.offset > 0);
const hasNext = computed(
  () => pagination.offset + pagination.limit < totalRecipes.value
);

async function loadRecipes() {
  try {
    isLoading.value = true;

    if (recipeType === RECIPE_TYPE.SAVED) {
      recipes.value = await trpc.users.getSavedRecipes.query({
        userId,
        ...pagination,
      });
    } else {
      recipes.value = await trpc.users.getCreatedRecipes.query({
        userId,
        ...pagination,
      });
    }
  } finally {
    isLoading.value = false;
  }
}

async function loadTotal() {
  if (recipeType === RECIPE_TYPE.SAVED) {
    totalRecipes.value = await trpc.users.totalSaved.query(userId);
  } else {
    totalRecipes.value = await trpc.users.totalCreated.query(userId);
  }
}

async function prevPage() {
  pagination.offset -= pagination.limit;
  await loadRecipes();
}

async function nextPage() {
  pagination.offset += pagination.limit;
  await loadRecipes();
}

onMounted(async () => {
  await Promise.all([loadTotal(), loadRecipes()]);
});
</script>

<template>
  <div class="flex flex-col gap-5 lg:gap-7">
    <span
      class="text-primary-green inline-flex self-start rounded-3xl px-2 py-1 text-lg font-bold shadow-md lg:px-6 lg:py-2 lg:text-3xl"
    >
      {{ title }}
    </span>

    <div v-if="isLoading" class="flex justify-center">
      <Spinner />
    </div>

    <template v-else>
      <div v-if="recipes.length > 0" class="relative">
        <NavButton v-if="hasPrev" @click="prevPage" direction="left" />

        <div class="flex gap-4 overflow-x-auto lg:gap-5">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>

        <NavButton v-if="hasNext" @click="nextPage" direction="right" />
      </div>

      <div v-else>
        <NoRecipes :recipe-type="recipeType" />
      </div>
    </template>
  </div>
</template>
