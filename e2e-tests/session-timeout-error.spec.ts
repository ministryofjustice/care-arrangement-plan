import { test, expect } from '@playwright/test';

const SESSION_TIMEOUT_TITLE = "Sorry, you'll have to start again";

test.describe('Session timeout error (403)', () => {
  test('should return 403 and render the session timeout page', async ({ page }) => {
    const response = await page.goto('/dev/create-timeout');

    expect(response?.status()).toBe(403);
    await expect(page.locator('h1')).toContainText(SESSION_TIMEOUT_TITLE);
  });

  test('should display session timeout guidance', async ({ page }) => {
    await page.goto('/dev/create-timeout');

    await expect(page.getByText(/120 minutes/i)).toBeVisible();
    await expect(page.getByText(/saved any personal information/i)).toBeVisible();
    await expect(page.getByText(/start your child arrangement plan again/i)).toBeVisible();
  });

  test('should provide a start again button linking to safety check', async ({ page }) => {
    await page.goto('/dev/create-timeout');

    const startAgainButton = page.getByRole('button', { name: /^Start again$/i });
    await expect(startAgainButton).toBeVisible();
    await expect(startAgainButton).toHaveAttribute('href', '/safety-check');
  });

  test('should navigate to the start page when start again is clicked', async ({ page }) => {
    await page.goto('/dev/create-timeout');

    await page.getByRole('button', { name: /^Start again$/i }).click();
    await expect(page).toHaveURL('/');
  });
});
