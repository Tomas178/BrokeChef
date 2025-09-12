import { expect, test } from './fixtures-auth';
import { fakeRecipe } from './utils/fakeData';
import { fillInRecipeInfo } from './utils/recipe';

test.describe.serial('Create recipe, see the recipe and its owner', () => {
  const recipe = fakeRecipe();

  test('Create recipe', async ({ authPage }) => {
    await authPage.goto('/create-recipe');

    const form = authPage.getByRole('form', { name: 'Create recipe' });

    await form.getByTestId('recipe-title').fill(recipe.title);
    await form.getByTestId('cook-duration').fill(String(recipe.duration));
    await fillInRecipeInfo(authPage, 'ingredients', recipe.ingredients);
    await fillInRecipeInfo(authPage, 'kitchen-equipment', recipe.tools);
    await fillInRecipeInfo(authPage, 'steps', recipe.steps);

    await form.getByRole('button', { name: /publish|create/i }).click();

    const toastContainer = authPage.getByTestId('toast-body');

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toContainText(/creating/i);
    await expect(toastContainer).toContainText(/created/i, { timeout: 15000 });

    await authPage.waitForURL(/recipe\/\d+/i, { timeout: 15000 });
    await expect(authPage).toHaveURL(/recipe\/\d+/i);
  });
});
