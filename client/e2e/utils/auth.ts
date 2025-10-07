import { expect, Page } from '@playwright/test';
import { UserLogin, UserSignup } from './api';
import { ROUTE_PATHS } from '@/router/consts/routePaths';

export const HOME_PAGE_URL = '/?page=1&sort=newest';

export async function loginUser(page: Page, user: UserLogin) {
  const form = page.getByRole('form', { name: 'Signin' });
  await form.getByTestId('email').fill(user.email);
  await form.getByTestId('password').fill(user.password);

  await form.getByTestId('submit-button').click();
}

export async function checkAfterLogin(page: Page) {
  await expect(page).toHaveURL(HOME_PAGE_URL);
}

export async function fullLoginProcedure(page: Page, user: UserLogin) {
  await page.goto(ROUTE_PATHS.LOGIN);
  await loginUser(page, user);
  await checkAfterLogin(page);
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

  await page.waitForURL(ROUTE_PATHS.LOGIN);

  await expect(page).toHaveURL(ROUTE_PATHS.LOGIN);
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
