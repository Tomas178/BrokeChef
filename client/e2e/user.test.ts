import { test, expect } from '@playwright/test';

test.describe.serial('Signup and login sequence', () => {
  test('Visitor can signup', async ({ page }) => {
    await page.goto('/signup');
    const toastContainer = page.getByTestId('toast-body');

    await expect(toastContainer).toHaveCount(0);

    const form = page.getByRole('form', { name: 'Signup' });

    await form.locator('input[data-testid="username"]').fill('username123');
    await form.locator('input[data-testid="email"]').fill('username@gmail.com');
    await form.locator('input[data-testid="password"]').fill('password123');
    await form
      .locator('input[data-testid="repeat-password"]')
      .fill('password123');

    await form.locator('button[type="submit"]').click();

    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveText(/creating/i);
  });
});
