import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the homepage with correct title and start button', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Propose a child arrangements plan/);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const startButton = page.getByRole('button', { name: /start now/i });
    await expect(startButton).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    const cookiesLink = page.getByRole('link', { name: /cookies/i });
    await expect(cookiesLink).toBeVisible();

    const privacyLink = page.getByRole('link', { name: /privacy/i });
    await expect(privacyLink).toBeVisible();

    const accessibilityLink = page.getByRole('link', { name: /accessibility/i });
    await expect(accessibilityLink).toBeVisible();
  });

  test('should navigate to safety check when clicking start button (auth disabled)', async ({ page }) => {
    await page.goto('/');

    const startButton = page.getByRole('button', { name: /start now/i });
    await startButton.click();

    // When USE_AUTH=false, goes directly to safety check
    await expect(page).toHaveURL(/\/safety-check/);
  });
});
