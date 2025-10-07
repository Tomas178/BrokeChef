import { test as base, expect, Page } from '@playwright/test';
import { clearEmails, waitForEmailLink } from '../utils/mailhog';
import { fakeSignupUser } from '../utils/fakeData';
import { fullLoginProcedure, signupUser } from '../utils/auth';
import { ROUTE_PATHS } from '@/router/consts/routePaths';

export type User = ReturnType<typeof fakeSignupUser>;

type AuthFixtures = {
  auth: { page: Page; user: User };
};

export const test = base.extend<AuthFixtures>({
  auth: async ({ browser }, use) => {
    const [page] = await Promise.all([browser.newPage(), clearEmails()]);

    const user = fakeSignupUser();

    await page.goto(ROUTE_PATHS.SIGNUP);
    await signupUser(page, user);

    const verificationLink = await waitForEmailLink();

    await page.goto(verificationLink);

    await fullLoginProcedure(page, user);

    await use({ page, user });
    await page.close();
  },
});

export { expect };
