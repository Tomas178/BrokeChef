import { Page } from '@playwright/test';
import { TestId } from '@/components/Forms/CreateForm.vue';

export async function fillInRecipeInfo(
  page: Page,
  testId: TestId,
  items: string[]
) {
  const div = page.getByTestId(testId);

  for (let i = 0; i < items.length; i++) {
    await div.getByTestId(`input-${i}`).fill(items[i]);

    if (i < items.length - 1) {
      await div.getByRole('button', { name: /add/i }).click();
    }
  }
}
