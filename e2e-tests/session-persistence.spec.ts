import { test, expect } from '@playwright/test';

import { verifyBackNavigation } from './fixtures/navigation-helpers';

test.describe('Session Persistence', () => {
  test('should maintain form data when navigating back', async ({ page }) => {
    // Navigate through flow to number-of-children
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    // Complete safety checks
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Continue through do-whats-best - check the required checkbox
    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Complete court order check
    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Now on number-of-children
    await page.getByLabel(/How many children is this for/i).fill('2');
    await page.getByRole('button', { name: /continue/i }).click();

    await verifyBackNavigation(page, /\/number-of-children/, async () => {
      const input = page.getByLabel(/How many children is this for/i);
      await expect(input).toHaveValue('2');
    });
  });

  test('should handle cookie banner preferences', async ({ page }) => {
    await page.goto('/');

    const cookieBanner = page.locator('.govuk-cookie-banner');
    if ((await cookieBanner.count()) > 0) {
      await expect(cookieBanner).toBeVisible();

      const acceptButton = cookieBanner.getByRole('button', { name: /accept/i });
      if ((await acceptButton.count()) > 0) {
        await acceptButton.click();

        await expect(cookieBanner).not.toBeVisible();
      }
    }
  });
});
