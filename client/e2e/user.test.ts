import { test, expect } from '@playwright/test';
import { fakeSignupUser } from './utils/fakeData';
import { clearEmails, getVerifyLink } from './utils/mailhog';
import { asUser } from './utils/api';
import { loginUser } from './utils/auth';

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

    const form = page.getByRole('form', { name: 'Signup' });

    await form.locator('input[data-testid="username"]').fill(user.name);
    await form.locator('input[data-testid="email"]').fill(user.email);
    await form.locator('input[data-testid="password"]').fill(user.password);
    await form
      .locator('input[data-testid="repeat-password"]')
      .fill(user.password + 'a');

    await form.locator('button[type="submit"]').click();

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveText(/passwords/i);

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/passwords/i);
  });

  test('Visitor can signup', async ({ page }) => {
    await page.goto('/signup');
    const toastContainer = page.getByTestId('toast-body');

    await expect(toastContainer).toBeHidden();

    const form = page.getByRole('form', { name: 'Signup' });

    await form.locator('input[data-testid="username"]').fill(user.name);
    await form.locator('input[data-testid="email"]').fill(user.email);
    await form.locator('input[data-testid="password"]').fill(user.password);
    await form
      .locator('input[data-testid="repeat-password"]')
      .fill(user.password);

    await form.locator('button[type="submit"]').click();

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveText(/creating/i);
  });

  test.describe('Redirections based on login status', () => {
    test('Visitor can access homepage without being logged in', async ({
      page,
    }) => {
      await page.goto('/');

      await page.waitForURL('/');

      await expect(page).toHaveURL('/');
    });

    test('Visitor cannot access profile page without being logged in', async ({
      page,
    }) => {
      await page.goto('/profile');

      await page.waitForURL('/login');

      await expect(page).toHaveURL('/login');
    });

    test('Visitor cannot access recipe page without being logged in', async ({
      page,
    }) => {
      await page.goto('/recipe/1');

      await page.waitForURL('/login');

      await expect(page).toHaveURL('/login');
    });

    test('Visitor cannot access create recipe page without being logged in', async ({
      page,
    }) => {
      await page.goto('/create-recipe');

      await page.waitForURL('/login');

      await expect(page).toHaveURL('/login');
    });
  });

  test('Visitor is shown that email needs to be verified', async ({ page }) => {
    await page.goto('/login');
    const toastContainer = page.getByTestId('toast-body');

    await expect(toastContainer).toBeHidden();

    const form = page.getByRole('form', { name: 'Signin' });
    await form.locator('input[data-testid="email"]').fill(user.email);
    await form.locator('input[data-testid="password"]').fill(user.password);

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
