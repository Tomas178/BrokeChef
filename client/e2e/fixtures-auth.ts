import { test as base, expect, Page } from '@playwright/test';
import { clearEmails, getLatestEmailLink } from './utils/mailhog';
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

    let verificationLink: string | null = null;
    const timeout = 10000;
    const interval = 500;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        verificationLink = await getLatestEmailLink();
        if (verificationLink) break;
      } catch {
        // email not yet ready
      }
      await new Promise((res) => setTimeout(res, interval));
    }

    if (!verificationLink)
      throw new Error('Verification email not received in time');

    await page.goto(verificationLink);

    await page.goto('/login');
    await loginUser(page, user);
    await checkAfterLogin(page);

    await use(page);
    await page.close();
  },
});

export { expect };
