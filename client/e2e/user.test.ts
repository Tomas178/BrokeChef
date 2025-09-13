import { test, expect, Locator } from '@playwright/test';
import { fakeSignupUser } from './utils/fakeData';
import { clearEmails, waitForEmailLink } from './utils/mailhog';
import {
  checkAfterLogin,
  checkIfRedirects,
  loginUser,
  requestResetPassword,
  resetPassword,
  signupUser,
  URL_LOGGED_IN,
} from './utils/auth';
import {
  checkLocator,
  getErrorMessage,
  getToastContainer,
} from './utils/toast';

const user = fakeSignupUser();

const ERROR_MISMATCHING_PASSWORDS = /passwords/i;
const ERROR_TOO_SHORT_PASSWORD = /short/i;
const ERROR_EMAIL_TAKEN = /taken|exists/i;
const ERROR_VERIFY_EMAIL = /email/i;

const MESSAGE_EMAIL_SENT = /sent|check/i;
const MESSAGE_PASSWORD_CHANGED = /reset|changed/i;

test.describe.serial('Signup and login sequence', () => {
  test.beforeAll(async () => {
    await clearEmails();
  });

  test('Visitor is shown that passwords do not match', async ({ page }) => {
    await page.goto('/signup');

    const toastContainer = await getToastContainer(page);
    const errorMessage = await getErrorMessage(page);

    await signupUser(page, user, false);

    await checkLocator(toastContainer, ERROR_MISMATCHING_PASSWORDS);
    await checkLocator(errorMessage, ERROR_MISMATCHING_PASSWORDS);
  });

  test('Visitor is shown that password is too short', async ({ page }) => {
    await page.goto('/signup');

    const toastContainer = await getToastContainer(page);
    const errorMessage = await getErrorMessage(page);
    const userToShortPassword = { ...user, password: 'a' };

    await signupUser(page, userToShortPassword);

    await checkLocator(toastContainer, ERROR_TOO_SHORT_PASSWORD);
    await checkLocator(errorMessage, ERROR_TOO_SHORT_PASSWORD);
  });

  test('Visitor can signup', async ({ page }) => {
    await page.goto('/signup');

    const toastContainer = await getToastContainer(page);

    await signupUser(page, user);

    await checkLocator(toastContainer, /success|signed/i);
  });

  test('Visitor is shown that email is taken', async ({ page }) => {
    await page.goto('/signup');

    const toastContainer = await getToastContainer(page);
    const errorMessage = await getErrorMessage(page);

    await signupUser(page, user);

    await checkLocator(toastContainer, ERROR_EMAIL_TAKEN);
    await checkLocator(errorMessage, ERROR_EMAIL_TAKEN);
  });

  test.describe('Redirections based on login status', () => {
    test.describe('Allowed routes without being logged in', () => {
      test('Visitor can access homepage', async ({ page }) => {
        await page.goto('/');

        await page.waitForURL('/?page=1');

        await expect(page).toHaveURL('/?page=1');
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

  test.describe('Login', () => {
    let toastContainer: Locator;

    test.beforeEach(async ({ page }) => {
      await page.goto('/login');

      toastContainer = await getToastContainer(page);
    });

    test('Visitor is shown that email needs to be verified', async ({
      page,
    }) => {
      await loginUser(page, user);

      await checkLocator(toastContainer, ERROR_VERIFY_EMAIL);

      await page.reload();
      await expect(page).toHaveURL('/login');
    });

    test('Go to the verification link', async ({ page }) => {
      const verificationLink = await waitForEmailLink();
      await page.goto(verificationLink);

      await expect(page).toHaveURL(URL_LOGGED_IN, { timeout: 5000 });
    });

    test('Visitor should be able to login', async ({ page }) => {
      await loginUser(page, user);

      await checkLocator(toastContainer, /logged/i);

      await checkAfterLogin(page);
    });

    test('Visitor should be able to logout', async ({ page }) => {
      await test.step('1 - Login', async () => {
        await loginUser(page, user);

        await checkAfterLogin(page);
      });

      await test.step('2 - Logout', async () => {
        const logoutLink = page.getByRole('link', { name: 'Logout' });

        await logoutLink.click();

        await expect(logoutLink).toBeHidden();

        await expect(page).toHaveURL('/login');

        await page.reload();
        await expect(logoutLink).toBeHidden();
      });
    });
  });
});

test.describe.serial('Request and reset password sequence', () => {
  test.describe('Request reset password link', () => {
    test('Visitor should be shown that link was sent when given non-exisiting email', async ({
      page,
    }) => {
      const toastContainer = await getToastContainer(page);

      await test.step('1 - Go to request password page', async () => {
        await page.goto('/request-reset-password');
      });

      await test.step('2 - Request reset password', async () => {
        await requestResetPassword(page, user.email + 'a');
      });

      await test.step('3 - Assert', async () => {
        await checkLocator(toastContainer, MESSAGE_EMAIL_SENT);
      });
    });

    test('Visitor should be able to request a password reset link', async ({
      page,
    }) => {
      const toastContainer = await getToastContainer(page);

      await test.step('1 - Go to request password page', async () => {
        await page.goto('/request-reset-password');
      });

      await test.step('2 - Request reset password', async () => {
        await requestResetPassword(page, user.email);
      });

      await test.step('3 - Assert', async () => {
        await checkLocator(toastContainer, MESSAGE_EMAIL_SENT);
      });
    });
  });

  test.describe('Reset password', () => {
    let resetPasswordLink: string;
    let toastContainer: Locator;

    test.beforeAll(async () => {
      resetPasswordLink = await waitForEmailLink();
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(resetPasswordLink);

      toastContainer = await getToastContainer(page);
    });

    test('Visitor is shown that passwords do not match', async ({ page }) => {
      const errorMessage = await getErrorMessage(page);

      await resetPassword(page, 'password.123', false);

      await checkLocator(toastContainer, ERROR_MISMATCHING_PASSWORDS);
      await checkLocator(errorMessage, ERROR_MISMATCHING_PASSWORDS);
    });

    test('Visitor is shown that password is too short', async ({ page }) => {
      const errorMessage = await getErrorMessage(page);

      await resetPassword(page, 'a');

      await checkLocator(toastContainer, ERROR_TOO_SHORT_PASSWORD);
      await checkLocator(errorMessage, ERROR_TOO_SHORT_PASSWORD);
    });

    test('Visitor should be able to reset the password', async ({ page }) => {
      await resetPassword(page, user.password);

      await checkLocator(toastContainer, MESSAGE_PASSWORD_CHANGED);
    });
  });
});
