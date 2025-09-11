import { expect, Page } from '@playwright/test';
import { UserLogin, userSignup } from './api';

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

export async function signupUser(
  page: Page,
  user: userSignup,
  misMatchingPasswords = false
) {
  const form = page.getByRole('form', { name: 'Signup' });

  await form.getByTestId('username').fill(user.name);
  await form.getByTestId('email').fill(user.email);
  await form.getByTestId('password').fill(user.password);
  await form
    .getByTestId('repeat-password')
    .fill(misMatchingPasswords ? user.password + 'a' : user.password);

  await form.locator('button[type="submit"]').click();
}

export async function checkIfRedirects(page: Page, path: string) {
  await page.goto(path);

  await page.waitForURL('/login');

  await expect(page).toHaveURL('/login');
}
