<script lang="ts" setup>
import CreateForm from '@/components/Forms/CreateForm.vue';
import type { CreateRecipeInput } from '@server/shared/types';
import { FwbButton, FwbHeading, FwbInput } from 'flowbite-vue';
import { reactive, computed } from 'vue';
import { trpc } from '@/trpc';
import useErrorMessage from '@/composables/useErrorMessage';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { DEFAULT_SERVER_ERROR } from '@/consts';

const recipeForm = reactive<CreateRecipeInput>({
  title: '',
  duration: 0,
  steps: [''],
  ingredients: [''],
  tools: [''],
});

const durationString = computed({
  get: () => recipeForm.duration.toString(),
  set: (val: string) => {
    const parsed = parseInt(val);
    recipeForm.duration = isNaN(parsed) ? 0 : parsed;
  },
});

const [createRecipe] = useErrorMessage(async () => {
  const recipe = await toast.promise(trpc.recipes.create.mutate(recipeForm), {
    pending: 'Creating recipe...',
    success: 'Recipe has been created!',
    error: {
      render(err) {
        if (err?.data?.message) return err.data.message;
        return DEFAULT_SERVER_ERROR;
      },
    },
  });

  console.log(recipe);

  recipeForm.title = '';
  recipeForm.duration = 0;
  recipeForm.steps = [''];
  recipeForm.ingredients = [''];
  recipeForm.tools = [''];
});
</script>

<template>
  <form
    class="mx-4 mt-8 mb-12 md:mx-32 md:mt-14 md:mb-28"
    aria-label="Recipe"
    @submit.prevent="createRecipe"
  >
    <div class="flex flex-col gap-4 md:gap-6">
      <div class="justify-center text-3xl md:text-6xl">
        <span class="text-primary-green font-bold">Create a New <br /></span>
        <span class="text-submit-text font-bold">Recipe</span>
      </div>
      <div class="flex items-end justify-end">
        <FwbButton
          type="submit"
          class="gradient-action-button text-submit-text rounded-3xl px-6 py-2 hover:scale-105"
        >
          <template #prefix>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="#556987"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 8L12 3L7 8"
                stroke="#556987"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 3V15"
                stroke="#556987"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
          Publish Recipe
        </FwbButton>
      </div>
      <div class="flex flex-col gap-10 md:flex-row md:gap-8">
        <div class="flex flex-col gap-6 md:flex-1">
          <FwbHeading tag="h2">General Recipe Information</FwbHeading>
          <div class="rounded-4xl bg-white">
            <div class="m-4 flex flex-col gap-4 md:m-16">
              <FwbInput
                type="text"
                label="Recipe title"
                v-model="recipeForm.title"
                placeholder="eg: Savory Stuffed Bell Peppers"
                class="bg-white"
                wrapper-class="flex-1"
                :minlength="2"
                :required="true"
              />
              <FwbInput
                type="number"
                label="Cook duration"
                v-model="durationString"
                placeholder="30"
                class="bg-white"
                wrapper-class="flex-1"
                :min="1"
                :required="true"
              >
                <template #suffix><span>minutes</span></template>
              </FwbInput>
            </div>
          </div>
        </div>
        <CreateForm
          heading="Ingredients"
          form-label="Ingredients"
          placeholder="Ingredient"
          v-model="recipeForm.ingredients"
        />
      </div>
      <div class="flex flex-col gap-10 md:flex-row md:gap-8">
        <CreateForm
          heading="Kitchen Equipment"
          form-label="kitchen-equipment"
          placeholder="Equipment"
          v-model="recipeForm.tools"
        />
        <CreateForm
          heading="Steps"
          form-label="steps"
          placeholder="Step"
          v-model="recipeForm.steps"
        />
      </div>
    </div>
  </form>
</template>
