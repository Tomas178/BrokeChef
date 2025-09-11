import { test, expect } from '@playwright/test';
import { fakeSignupUser } from './utils/fakeData';
import { clearEmails, getVerifyLink } from './utils/mailhog';
import { asUser } from './utils/api';
import { checkIfRedirects, loginUser, signupUser } from './utils/auth';

const user = fakeSignupUser();

test.describe.serial('Signup and login sequence', () => {
  test.beforeAll(async () => {
    await clearEmails();
  });

  test('Visitor is shown that passwords do not match', async ({ page }) => {
    await page.goto('/signup');
    const toastContainer = page.getByTestId('toast-body');
    const errorMessage = page.getByTestId('errorMessage');

    await expect(toastContainer).toBeHidden();
    await expect(errorMessage).toBeHidden();

    await signupUser(page, user, true);

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveText(/passwords/i);

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/passwords/i);
  });

  test('Visitor is shown that password is too short', async ({ page }) => {
    await page.goto('/signup');
    const toastContainer = page.getByTestId('toast-body');
    const errorMessage = page.getByTestId('errorMessage');

    await expect(toastContainer).toBeHidden();
    await expect(errorMessage).toBeHidden();

    const userToShortPassword = { ...user, password: 'a' };

    await signupUser(page, userToShortPassword);

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveText(/short/i);

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/short/i);
  });

  test('Visitor can signup', async ({ page }) => {
    await page.goto('/signup');
    const toastContainer = page.getByTestId('toast-body');

    await expect(toastContainer).toBeHidden();

    await signupUser(page, user);

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveText(/creating/i);
  });

  test('Visitor is shown that email is taken', async ({ page }) => {
    await page.goto('/signup');
    const toastContainer = page.getByTestId('toast-body');
    const errorMessage = page.getByTestId('errorMessage');

    await expect(toastContainer).toBeHidden();
    await expect(errorMessage).toBeHidden();

    await signupUser(page, user);

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveText(/taken|exists/i);

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/taken|exists/i);
  });

  test.describe('Redirections based on login status', () => {
    test.describe('Allowed routes without being logged in', () => {
      test('Visitor can access homepage', async ({ page }) => {
        await page.goto('/');

        await page.waitForURL('/');

        await expect(page).toHaveURL('/');
      });
    });

    test.describe('Forbidden routes without being logged in', () => {
      test('Visitor cannot access profile page without being logged in', async ({
        page,
      }) => await checkIfRedirects(page, '/profile'));

      test('Visitor cannot access other user profile page without being logged in', async ({
        page,
      }) => await checkIfRedirects(page, '/profile/user1'));

      test('Visitor cannot access recipe page without being logged in', async ({
        page,
      }) => await checkIfRedirects(page, '/recipe/1'));

      test('Visitor cannot access create recipe page without being logged in', async ({
        page,
      }) => await checkIfRedirects(page, '/create-recipe'));
    });
  });

  test('Visitor is shown that email needs to be verified', async ({ page }) => {
    await page.goto('/login');
    const toastContainer = page.getByTestId('toast-body');

    await expect(toastContainer).toBeHidden();

    const form = page.getByRole('form', { name: 'Signin' });
    await form.getByTestId('email').fill(user.email);
    await form.getByTestId('password').fill(user.password);

    await form.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/login');

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveText(/email/i, { timeout: 5000 });

    await page.reload();
    await expect(page).toHaveURL('/login');
  });

  test('Go to the verification link', async ({ page }) => {
    let verificationLink: string;

    await test.step('Step 1 - Get the verification link', async () => {
      verificationLink = await getVerifyLink();
    });

    await test.step('Step 2 - Go to the verification link', async () => {
      await page.goto(verificationLink);

      await expect(page).toHaveURL('/', { timeout: 5000 });
    });
  });

  test('Visitor should be able to login', async ({ page }) => {
    await loginUser(page, user);
  });

  test('Visitor should be able to logout', async ({ page }) => {
    await test.step('Step 1 - Login', async () => {
      await loginUser(page, user);
    });

    await test.step('Step 2 - Logout', async () => {
      const logoutLink = page.getByRole('link', { name: 'Logout' });

      await logoutLink.click();

      await expect(logoutLink).toBeHidden();

      await expect(page).toHaveURL('/login');

      await page.reload();
      await expect(logoutLink).toBeHidden();
    });
  });
});
