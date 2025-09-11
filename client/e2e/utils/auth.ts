import { expect, Page } from '@playwright/test';
import { UserLogin } from './api';

export const URL_LOGGED_IN = '/?page=1';

export async function loginUser(page: Page, user: UserLogin) {
  await page.goto('/login');

  const toastContainer = page.getByTestId('toast-body');

  await expect(toastContainer).toBeHidden();

  const form = page.getByRole('form', { name: 'Signin' });
  await form.getByTestId('email').fill(user.email);
  await form.getByTestId('password').fill(user.password);

  await form.locator('button[type="submit"]').click();

  await expect(toastContainer).toBeVisible();
  await expect(toastContainer).toHaveText(/logging/i, { timeout: 5000 });

  await expect(page).toHaveURL(URL_LOGGED_IN);

  await page.reload();
  await expect(page).toHaveURL(URL_LOGGED_IN);
}
