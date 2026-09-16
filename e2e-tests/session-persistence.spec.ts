import { test, expect } from '@playwright/test';

import { verifyBackNavigation } from './fixtures/navigation-helpers';
import { emptyStorageState } from './fixtures/storage-state';

test.describe('Session Persistence', () => {
  test('should maintain form data when navigating back', async ({ page }) => {
    // Navigate through flow to number-of-children
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    // Complete safety checks
    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/no/i).first().check();
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
});

test.describe('Cookie banner', () => {
  test.use({ storageState: emptyStorageState });

  test('should accept analytics cookies from the banner', async ({ page }) => {
    await page.goto('/');

    const cookieBanner = page.locator('#cookie-banner');
    await expect(cookieBanner).toBeVisible();
    await expect(page.locator('#cookie-banner-main')).toBeVisible();

    await cookieBanner.getByRole('button', { name: /accept analytics cookies/i }).click();

    await expect(page.locator('#cookie-banner-accepted')).toBeVisible();
    await cookieBanner.getByRole('button', { name: /hide cookie message/i }).click();
    await expect(cookieBanner).toBeHidden();
  });

  test('should reject analytics cookies from the banner', async ({ page }) => {
    await page.goto('/');

    const cookieBanner = page.locator('#cookie-banner');
    await expect(cookieBanner).toBeVisible();

    await cookieBanner.getByRole('button', { name: /reject analytics cookies/i }).click();

    await expect(page.locator('#cookie-banner-rejected')).toBeVisible();
    await cookieBanner.getByRole('button', { name: /hide cookie message/i }).click();
    await expect(cookieBanner).toBeHidden();
  });
});
