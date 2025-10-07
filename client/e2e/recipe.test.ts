import { Locator } from '@playwright/test';
import { expect, test, User } from './fixtures/fullAuth';
import { fullLoginProcedure, HOME_PAGE_URL } from './utils/auth';
import { fakeRecipe, fakeRecipeAllInfo } from './utils/fakeData';
import {
  checkActionButton,
  checkRecipeMainInfo,
  deleteInput,
  fillAllRecipeInfo,
  ImageData,
} from './utils/recipe';
import { checkLocator, getToastContainer } from './utils/toast';
import { ROUTE_PATHS } from '@/router/consts/routePaths';

const CREATE_RECIPE_PATH = ROUTE_PATHS.CREATE_RECIPE;
const LOADING_MESSAGE = /creating/i;

test.describe.serial('Create recipe without image and delete it', () => {
  const recipe = fakeRecipe();
  let recipeId: number;
  let creator: User;
  let visitor: User;
  let recipeAllInfo: ReturnType<typeof fakeRecipeAllInfo>;

  test.describe('Create recipe flow', () => {
    test('Allows removing input', async ({ auth }) => {
      const { page, user } = auth;
      creator = user;

      const ingredientsTestId = 'ingredients';

      await page.goto(CREATE_RECIPE_PATH);

      const form = page.getByRole('form', { name: 'Create recipe' });
      await fillAllRecipeInfo(form, recipe);
      await deleteInput(form, ingredientsTestId, 1);

      const card = form.getByTestId(ingredientsTestId);

      const inputs = await card.getByTestId(/^input-\d+$/).all();

      expect(inputs.length).toBe(recipe.ingredients.length - 1);
    });

    test('Create the recipe', async ({ page }) => {
      await fullLoginProcedure(page, creator);

      await page.goto(CREATE_RECIPE_PATH);

      const toastContainer = await getToastContainer(page);

      const form = page.getByRole('form', { name: 'Create recipe' });

      await fillAllRecipeInfo(form, recipe);

      await form.getByRole('button', { name: /publish|create/i }).click();

      await checkLocator(toastContainer, /created/i, /creating/i);

      await page.waitForURL(/recipe\/\d+/i);
      await expect(page).toHaveURL(/recipe\/\d+/i);

      recipeId = Number(page.url().split('/').pop());

      recipeAllInfo = fakeRecipeAllInfo({
        id: recipeId,
        author: {
          email: creator.email,
          name: creator.name,
          image: 'image',
        },
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        tools: recipe.tools,
        duration: recipe.duration,
        title: recipe.title,
      });
    });
  });

  test('Check recipe information', async ({ auth }) => {
    const { page, user } = auth;
    visitor = user;

    await page.goto(`/recipe/${recipeId}`);

    await checkRecipeMainInfo(page, recipeAllInfo);
  });

  test.describe('Visitor actions', () => {
    let toastContainer: Locator;

    test.beforeEach(async ({ page }) => {
      await fullLoginProcedure(page, visitor);
      await page.goto(`/recipe/${recipeId}`);
      toastContainer = await getToastContainer(page);
    });

    test('Save the recipe', async ({ page }) => {
      const saveButton = await checkActionButton(page, 'save');
      await saveButton.click();

      await checkLocator(toastContainer, /saved|success/i);

      await checkActionButton(page, 'unsave');

      await page.reload();
      await checkActionButton(page, 'unsave');
    });

    test('Unsave the recipe', async ({ page }) => {
      const unsaveButton = await checkActionButton(page, 'unsave');
      await unsaveButton.click();

      await checkLocator(toastContainer, /unsaved|success/i);

      await checkActionButton(page, 'save');

      await page.reload();
      await checkActionButton(page, 'save');
    });
  });

  test.describe('Delete the recipe', () => {
    let toastContainer: Locator;
    let deleteButton: Locator;

    test.beforeEach(async ({ page }) => {
      await fullLoginProcedure(page, creator);
      await page.goto(`/recipe/${recipeId}`);

      toastContainer = await getToastContainer(page);
      deleteButton = await checkActionButton(page, 'delete');
      await deleteButton.click();
    });

    test('Cancel deletion', async ({ page }) => {
      const dialog = page.getByRole('dialog');

      const cancelButton = dialog.getByTestId('dialog-cancel');
      await cancelButton.click();

      await Promise.all([
        expect(deleteButton).toBeVisible(),
        expect(dialog).toBeHidden(),
        expect(toastContainer).toBeHidden(),
        expect(page).toHaveURL(`/recipe/${recipeId}`),
      ]);
    });

    test('Delete the recipe', async ({ page }) => {
      const dialog = page.getByRole('dialog');
      const confirmButton = dialog.getByTestId('dialog-confirm');
      await confirmButton.click();

      await expect(dialog).toBeHidden();
      await checkLocator(toastContainer, /deleted|removed/i);

      await expect(page).toHaveURL(HOME_PAGE_URL);
    });
  });
});

test.describe.serial('Create recipe with image', () => {
  const recipe = fakeRecipe();
  let creator: User;
  let recipeId: number;
  let recipeAllInfo: ReturnType<typeof fakeRecipeAllInfo>;

  test('Should not allow image mimetype other than .png or .jpeg', async ({
    auth,
  }) => {
    const { page, user } = auth;
    creator = user;

    await page.goto(CREATE_RECIPE_PATH);
    const toastContainer = await getToastContainer(page);
    const form = page.getByRole('form', { name: 'Create recipe' });

    const imageData: ImageData = {
      filePath: '../assets/pdf.pdf',
      mimeType: 'application/pdf',
    };

    await fillAllRecipeInfo(form, recipe, imageData);

    await form.getByRole('button', { name: /publish|create/i }).click();

    await checkLocator(toastContainer, /supported|types|format/i);

    await expect(page).toHaveURL(CREATE_RECIPE_PATH);
  });

  test('Create the recipe', async ({ page }) => {
    await fullLoginProcedure(page, creator);

    await page.goto(CREATE_RECIPE_PATH);
    const toastContainer = await getToastContainer(page);
    const form = page.getByRole('form', { name: 'Create recipe' });

    const imageData: ImageData = {
      filePath: '../assets/test-image.png',
      mimeType: 'image/png',
    };

    await fillAllRecipeInfo(form, recipe, imageData);

    await form.getByRole('button', { name: /publish|create/i }).click();

    await checkLocator(toastContainer, /created/i, LOADING_MESSAGE);

    await page.waitForURL(/recipe\/\d+/i);
    await expect(page).toHaveURL(/recipe\/\d+/i);

    recipeId = Number(page.url().split('/').pop());

    recipeAllInfo = fakeRecipeAllInfo({
      id: recipeId,
      author: {
        email: creator.email,
        name: creator.name,
        image: 'image',
      },
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tools: recipe.tools,
      duration: recipe.duration,
      title: recipe.title,
    });
  });

  test('Check recipe information', async ({ auth }) => {
    const { page } = auth;

    await page.goto(`/recipe/${recipeId}`);

    await checkRecipeMainInfo(page, recipeAllInfo);
  });
});
