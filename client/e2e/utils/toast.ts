import { expect, Locator, Page } from '@playwright/test';

export async function getToastContainer(page: Page): Promise<Locator> {
  const toastContainer = page.getByTestId('toast-body');
  await expect(toastContainer).toBeHidden();

  return toastContainer;
}

export async function getErrorMessage(page: Page): Promise<Locator> {
  const errorMessage = page.getByTestId('error-message');
  await expect(errorMessage).toBeHidden();

  return errorMessage;
}

export async function checkLocator(
  locator: Locator,
  responseMessage: string | RegExp
) {
  await expect(locator).toBeVisible();

  await expect(locator).toContainText(responseMessage, { timeout: 20000 });
}
