import { test, expect } from '@playwright/test';

const GENERIC_ERROR_TITLE = 'Sorry, there is a problem with the service';

test.describe('Generic error (500)', () => {
  test('should return 500 and render the generic error page', async ({ page }) => {
    const response = await page.goto('/dev/create-generic-error');

    expect(response?.status()).toBe(500);
    await expect(page.locator('h1')).toContainText(GENERIC_ERROR_TITLE);
  });

  test('should display generic error guidance', async ({ page }) => {
    await page.goto('/dev/create-generic-error');

    await expect(page.getByText(/try again later/i)).toBeVisible();
    await expect(page.getByText(/find information/i)).toBeVisible();
    await expect(page.getByText(/contact us/i)).toBeVisible();
  });
});
