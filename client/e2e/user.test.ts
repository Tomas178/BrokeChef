import { test, expect } from '@playwright/test';
import { fakeSignupUser } from './utils/fakeData';
import { clearEmails, waitForEmailLink } from './utils/mailhog';
import {
  checkAfterLogin,
  checkIfRedirects,
  loginUser,
  requestResetPassword,
  resetPassword,
  signupUser,
} from './utils/auth';
import { checkLocator } from './utils/toast';

const user = fakeSignupUser();

const TOAST_TEST_ID = 'toast-content';
const ERROR_MESSAGE_TEST_ID = 'error-message';

const LOADING_SIGNUP_MESSAGE = /creating/i;
const LOADING_LOGIN_MESSAGE = /logging/i;
const LOADING_REQUEST_PASSWORD = /sending/i;
const LOADING_RESET_PASSWORD = /resetting|changing/i;

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

    await signupUser(page, user, false);

    await checkLocator(page, TOAST_TEST_ID, ERROR_MISMATCHING_PASSWORDS);
    await checkLocator(
      page,
      ERROR_MESSAGE_TEST_ID,
      ERROR_MISMATCHING_PASSWORDS
    );
  });

  test('Visitor is shown that password is too short', async ({ page }) => {
    await page.goto('/signup');

    const userToShortPassword = { ...user, password: 'a' };
    await signupUser(page, userToShortPassword);

    await checkLocator(page, TOAST_TEST_ID, ERROR_TOO_SHORT_PASSWORD);
    await checkLocator(page, ERROR_MESSAGE_TEST_ID, ERROR_TOO_SHORT_PASSWORD);
  });

  test('Visitor can signup', async ({ page }) => {
    await page.goto('/signup');

    await signupUser(page, user);

    await checkLocator(
      page,
      TOAST_TEST_ID,
      /success|signed/i,
      LOADING_SIGNUP_MESSAGE
    );
  });

  test('Visitor is shown that email is taken', async ({ page }) => {
    await page.goto('/signup');

    await signupUser(page, user);

    await checkLocator(
      page,
      TOAST_TEST_ID,
      ERROR_EMAIL_TAKEN,
      LOADING_SIGNUP_MESSAGE
    );
    await checkLocator(page, ERROR_MESSAGE_TEST_ID, ERROR_EMAIL_TAKEN);
  });

  test.describe('Redirections based on login status', () => {
    test.describe('Allowed routes without being logged in', () => {
      test('Visitor can access homepage', async ({ page }) => {
        await page.goto('/');

        await page.waitForURL('/');

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
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('Visitor is shown that email needs to be verified', async ({
      page,
    }) => {
      await loginUser(page, user);

      await checkLocator(
        page,
        TOAST_TEST_ID,
        ERROR_VERIFY_EMAIL,
        LOADING_LOGIN_MESSAGE
      );

      await page.reload();
      await expect(page).toHaveURL('/login');
    });

    test('Go to the verification link', async ({ page }) => {
      const verificationLink = await waitForEmailLink();
      await page.goto(verificationLink);

      await expect(page).toHaveURL('/', { timeout: 5000 });
    });

    test('Visitor should be able to login', async ({ page }) => {
      await loginUser(page, user);

      await checkLocator(
        page,
        TOAST_TEST_ID,
        /logging/i,
        LOADING_LOGIN_MESSAGE
      );

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
      await test.step('1 - Go to request password page', async () => {
        await page.goto('/request-reset-password');
      });

      await test.step('2 - Request reset password', async () => {
        await requestResetPassword(page, user.email + 'a');
      });

      await test.step('3 - Assert', async () => {
        await checkLocator(
          page,
          TOAST_TEST_ID,
          MESSAGE_EMAIL_SENT,
          LOADING_REQUEST_PASSWORD
        );
      });
    });

    test('Visitor should be able to request a password reset link', async ({
      page,
    }) => {
      await test.step('1 - Go to request password page', async () => {
        await page.goto('/request-reset-password');
      });

      await test.step('2 - Request reset password', async () => {
        await requestResetPassword(page, user.email);
      });

      await test.step('3 - Assert', async () => {
        await checkLocator(
          page,
          TOAST_TEST_ID,
          MESSAGE_EMAIL_SENT,
          LOADING_REQUEST_PASSWORD
        );
      });
    });
  });

  test.describe('Reset password', () => {
    let resetPasswordLink: string;

    test.beforeAll(async () => {
      resetPasswordLink = await waitForEmailLink();
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(resetPasswordLink);
    });

    test('Visitor is shown that passwords do not match', async ({ page }) => {
      await resetPassword(page, 'password.123', false);

      await checkLocator(page, TOAST_TEST_ID, ERROR_MISMATCHING_PASSWORDS);
      await checkLocator(
        page,
        ERROR_MESSAGE_TEST_ID,
        ERROR_MISMATCHING_PASSWORDS
      );
    });

    test('Visitor is shown that password is too short', async ({ page }) => {
      await resetPassword(page, 'a');

      await checkLocator(page, TOAST_TEST_ID, ERROR_TOO_SHORT_PASSWORD);
      await checkLocator(page, ERROR_MESSAGE_TEST_ID, ERROR_TOO_SHORT_PASSWORD);
    });

    test('Visitor should be able to reset the password', async ({ page }) => {
      await resetPassword(page, user.password);

      await checkLocator(
        page,
        TOAST_TEST_ID,
        MESSAGE_PASSWORD_CHANGED,
        LOADING_RESET_PASSWORD
      );
    });
  });
});
