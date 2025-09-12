import { expect, Page } from '@playwright/test';

export async function checkLocator(
  page: Page,
  testId: string,
  responseMessage: string | RegExp,
  loadingMessage?: string | RegExp
) {
  const locator = page.getByTestId(testId);

  if (loadingMessage) await expect(locator).toContainText(loadingMessage);

  await expect(locator).toContainText(responseMessage, { timeout: 10000 });
}
