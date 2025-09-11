import { expect, test } from './fixtures-auth';
import { fakeRecipe } from './utils/fakeData';
import { fillInRecipeInfo } from './utils/recipe';
import { getToastContainer } from './utils/toast';

test.describe.serial('Create recipe, see the recipe and its owner', () => {
  const recipe = fakeRecipe();

  test('Create recipe', async ({ authPage }) => {
    await authPage.goto('/create-recipe');

    const toastContainer = await getToastContainer(authPage);

    const form = authPage.getByRole('form', { name: 'Create recipe' });

    await form.getByTestId('recipe-title').fill(recipe.title);
    await form.getByTestId('cook-duration').fill(String(recipe.duration));
    await fillInRecipeInfo(authPage, 'ingredients', recipe.ingredients);
    await fillInRecipeInfo(authPage, 'kitchen-equipment', recipe.tools);
    await fillInRecipeInfo(authPage, 'steps', recipe.steps);

    await form.getByRole('button', { name: /publish|create/i }).click();

    await expect(toastContainer).toContainText(/creating/i);

    await authPage.waitForURL(/recipe\/\d+/i, { timeout: 15000 });
  });
});
