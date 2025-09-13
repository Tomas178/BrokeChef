import { expect, Locator, Page } from '@playwright/test';
import { TestId } from '@/components/Forms/CreateForm.vue';
import { fakeRecipe, fakeRecipeAllInfo } from './fakeData';
import { RecipeCardTitle } from '../../src/components/RecipeDetailsCard.vue';

export async function fillInRecipeInfo(
  form: Locator,
  testId: TestId,
  items: string[]
) {
  const div = form.getByTestId(testId);

  for (let i = 0; i < items.length; i++) {
    await div.getByTestId(`input-${i}`).fill(items[i]);

    if (i < items.length - 1) {
      await div.getByRole('button', { name: /add/i }).click();
    }
  }
}

export async function fillAllRecipeInfo(
  form: Locator,
  recipe: ReturnType<typeof fakeRecipe>
) {
  await form.getByTestId('recipe-title').fill(recipe.title);
  await form.getByTestId('cook-duration').fill(String(recipe.duration));
  await fillInRecipeInfo(form, 'ingredients', recipe.ingredients);
  await fillInRecipeInfo(form, 'kitchen-equipment', recipe.tools);
  await fillInRecipeInfo(form, 'steps', recipe.steps);
}

export async function checkRecipeMainInfo(
  page: Page,
  recipe: ReturnType<typeof fakeRecipeAllInfo>
) {
  await Promise.all([
    checkRecipePageLocator(page, 'image'),
    checkRecipePageLocator(page, 'author', recipe.author.name),
    checkRecipePageLocator(page, 'duration', recipe.duration.toString()),
    expect(page.getByTestId('created-at')).toBeVisible(),

    checkMultiItems(page, 'Ingredients', recipe.ingredients),
    checkMultiItems(page, 'Tools', recipe.tools),
    checkMultiItems(page, 'Steps', recipe.steps),
  ]);
}

export async function checkMultiItems(
  page: Page,
  testId: RecipeCardTitle | 'Steps',
  items: string[]
) {
  const card = page.getByTestId(testId);

  for (const item of items) {
    await expect(card.getByText(item)).toBeVisible();
  }
}

export async function checkActionButton(page: Page, name: string) {
  const button = page.getByRole('button', { name: name });

  await expect(button).toBeVisible();

  return button;
}

async function checkRecipePageLocator(
  page: Page,
  testId: string,
  text?: string
) {
  const locator = page.getByTestId(testId);

  await expect(locator).toBeVisible();

  if (text) await expect(locator).toContainText(text);
}

export async function deleteInput(
  form: Locator,
  testId: TestId,
  index: number
) {
  const card = form.getByTestId(testId);
  await card.getByTestId(`remove-input-${index}`).click();
}
