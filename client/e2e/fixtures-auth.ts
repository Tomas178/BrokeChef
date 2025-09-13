import { test as base, expect, Page } from '@playwright/test';
import { clearEmails, waitForEmailLink } from './utils/mailhog';
import { fakeSignupUser } from './utils/fakeData';
import { checkAfterLogin, loginUser, signupUser } from './utils/auth';

type AuthFixtures = {
  authPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authPage: async ({ browser }, use) => {
    await clearEmails();

    const page = await browser.newPage();
    const user = fakeSignupUser();

    await page.goto('/signup');
    await signupUser(page, user);

    const verificationLink = await waitForEmailLink();

    await page.goto(verificationLink);

    await page.goto('/login');
    await loginUser(page, user);
    await checkAfterLogin(page);

    await use(page);
    await page.close();
  },
});

export { expect };
