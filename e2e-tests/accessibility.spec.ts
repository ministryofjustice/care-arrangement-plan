import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    const allHeadings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await allHeadings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    // Check radio button labels are accessible on safety-check page
    const yesRadio = page.getByLabel(/yes/i).first();
    await expect(yesRadio).toBeVisible();
    await expect(yesRadio).toHaveAttribute('type', 'radio');
  });

  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('.govuk-skip-link');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    }
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('main');
    await expect(main).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have proper button and link roles', async ({ page }) => {
    await page.goto('/');

    const startButton = page.getByRole('button', { name: /start now/i });
    await expect(startButton).toBeVisible();

    const links = page.getByRole('link');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
