import { test as base, expect, Page } from '@playwright/test';
import { clearEmails, waitForEmailLink } from '../utils/mailhog';
import { fakeSignupUser } from '../utils/fakeData';
import { checkAfterLogin, loginUser, signupUser } from '../utils/auth';

export type User = ReturnType<typeof fakeSignupUser>;

type AuthFixtures = {
  auth: { page: Page; user: User };
};

export const test = base.extend<AuthFixtures>({
  auth: async ({ browser }, use) => {
    const [page] = await Promise.all([browser.newPage(), clearEmails()]);

    const user = fakeSignupUser();

    await page.goto('/signup');
    await signupUser(page, user);

    const verificationLink = await waitForEmailLink();

    await page.goto(verificationLink);

    await page.goto('/login');
    await loginUser(page, user);
    await checkAfterLogin(page);

    await use({ page, user });
    await page.close();
  },
});

export { expect };
