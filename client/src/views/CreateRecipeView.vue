<script lang="ts" setup>
import CreateForm from '@/components/Forms/CreateForm.vue';
import { FwbButton, FwbHeading, FwbInput, FwbFileInput } from 'flowbite-vue';
import { useRecipesService } from '@/composables/useRecipesService';
import {
  MAX_DURATION,
  MAX_RECIPE_TITLE_LENGTH,
  MIN_DURATION,
  MIN_RECIPE_TITLE_LENGTH,
} from '@server/shared/consts';

const { recipeForm, recipeImageFile, durationString, handleCreateRecipe } =
  useRecipesService();
</script>

<template>
  <form
    class="mx-4 mt-8 mb-12 md:mx-16 md:mt-12 md:mb-20 lg:mx-32 lg:mt-14 lg:mb-28"
    aria-label="Create recipe"
    @submit.prevent="handleCreateRecipe"
  >
    <div class="flex flex-col gap-4 md:gap-6">
      <div class="justify-center text-3xl md:text-6xl">
        <span class="text-primary-green font-bold">Create a New <br /></span>
        <span class="text-submit-text font-bold">Recipe</span>
      </div>
      <div class="flex items-end justify-end">
        <FwbButton
          type="submit"
          class="gradient-action-button text-submit-text dark:text-submit-text-dark cursor-pointer rounded-3xl px-6 py-2 hover:scale-105"
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
      <div class="flex flex-col gap-10 md:gap-8 lg:flex-row">
        <div class="flex flex-col gap-6 lg:flex-1">
          <FwbHeading tag="h2" class="lg:text-nowrap"
            >General Recipe Information
          </FwbHeading>
          <div class="dark:bg-background-recipe-card-dark rounded-4xl bg-white">
            <div class="m-4 flex flex-col gap-4 md:m-16">
              <FwbInput
                data-testid="recipe-title"
                type="text"
                label="Recipe title"
                v-model="recipeForm.title"
                placeholder="eg: Savory Stuffed Bell Peppers"
                class="bg-white"
                wrapper-class="flex-1 dark:text-white"
                :minlength="MIN_RECIPE_TITLE_LENGTH"
                :maxlength="MAX_RECIPE_TITLE_LENGTH"
                :required="true"
              />
              <FwbInput
                data-testid="cook-duration"
                type="number"
                label="Cook duration"
                v-model="durationString"
                placeholder="30"
                class="bg-white"
                wrapper-class="flex-1 dark:text-white"
                :min="MIN_DURATION"
                :max="MAX_DURATION"
                :required="true"
              >
                <template #suffix><span>minutes</span></template>
              </FwbInput>
            </div>
          </div>
        </div>
        <CreateForm
          heading="Ingredients"
          testId="ingredients"
          placeholder="Ingredient"
          v-model="recipeForm.ingredients"
        />
      </div>
      <div class="flex flex-col gap-10 md:gap-8 lg:flex-row">
        <CreateForm
          heading="Kitchen Equipment"
          testId="kitchen-equipment"
          placeholder="Equipment"
          v-model="recipeForm.tools"
        />
        <CreateForm
          heading="Steps"
          testId="steps"
          placeholder="Step"
          v-model="recipeForm.steps"
        />
      </div>
      <div class="flex">
        <FwbFileInput
          v-model="recipeImageFile"
          label="Recipe Image"
          size="xs"
          accept="image/*"
          class="flex-1"
        >
          <p
            class="text-primary-green !mt-1 text-sm font-bold tracking-wide dark:text-gray-300"
          >
            If you do not provide an image then AI will create one :)
          </p>
        </FwbFileInput>
      </div>
    </div>
  </form>
</template>
