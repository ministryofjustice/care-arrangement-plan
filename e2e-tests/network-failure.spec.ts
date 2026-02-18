import { test, expect } from '@playwright/test';

import {
  completeOnboardingFlow,
  interceptPostWithError,
  interceptPostWithTransientError,
  expectServiceErrorPage,
} from './fixtures/test-helpers';

test.describe('Server Error Response Handling', () => {
  test.describe('Error page rendering', () => {
    test('should show error page when POST returns 500', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('2');
      await interceptPostWithError(page, '**/number-of-children', 500);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
    });

    test('should show error page when POST returns 503', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('1');
      await interceptPostWithError(page, '**/number-of-children', 503);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
    });

    test('should not display a technical stack trace to the user on error', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('2');
      await interceptPostWithError(page, '**/number-of-children', 500);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
      await expect(page.locator('body')).not.toContainText('Error:');
      await expect(page.locator('body')).not.toContainText('TypeError');
      await expect(page.locator('body')).not.toContainText('at Object');
    });
  });

  test.describe('User can navigate back and resubmit after a server error', () => {
    test('should allow user to navigate back and resubmit successfully', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('2');
      await interceptPostWithTransientError(page, '**/number-of-children', { status: 500, failCount: 1 });

      await page.getByRole('button', { name: /continue/i }).click();
      await expectServiceErrorPage(page);

      await page.goto('/number-of-children');
      await page.getByLabel(/How many children is this for/i).fill('2');
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/about-the-children/);
    });
  });
});
