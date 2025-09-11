import { expect, Page } from '@playwright/test';
import { UserLogin, UserSignup } from './api';

const URL_LOGGED_IN = '/?page=1';

export async function loginUser(page: Page, user: UserLogin) {
  const form = page.getByRole('form', { name: 'Signin' });
  await form.getByTestId('email').fill(user.email);
  await form.getByTestId('password').fill(user.password);

  await form.getByTestId('submit-button').click();
}

export async function checkAfterLogin(page: Page) {
  await expect(page).toHaveURL(URL_LOGGED_IN, { timeout: 5000 });

  await page.reload();
  await expect(page).toHaveURL(URL_LOGGED_IN, { timeout: 5000 });
}

export async function signupUser(
  page: Page,
  user: UserSignup,
  matchingPasswords = true
) {
  const form = page.getByRole('form', { name: 'Signup' });

  await form.getByTestId('username').fill(user.name);
  await form.getByTestId('email').fill(user.email);
  await form.getByTestId('password').fill(user.password);
  await form
    .getByTestId('repeat-password')
    .fill(matchingPasswords ? user.password : user.password + 'a');

  await form.getByTestId('submit-button').click();
}

export async function checkIfRedirects(page: Page, path: string) {
  await page.goto(path);

  await page.waitForURL('/login');

  await expect(page).toHaveURL('/login');
}

export async function requestResetPassword(page: Page, email: string) {
  const form = page.getByRole('form', {
    name: 'request-reset-password-link',
  });

  await form.getByTestId('email').fill(email);

  await form.getByTestId('submit-button').click();
}

export async function resetPassword(
  page: Page,
  password: string,
  matchingPasswords = true
) {
  const form = page.getByRole('form', { name: 'reset-password' });

  await form.getByTestId('password').fill(password);
  await form
    .getByTestId('repeat-password')
    .fill(matchingPasswords ? password : password + 'a');

  await form.getByTestId('submit-button').click();
}
