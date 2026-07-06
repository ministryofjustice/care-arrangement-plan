import { test, expect } from '@playwright/test';

import { goToSafetyCheck } from './fixtures/test-helpers';

test.describe('User Journey Flow', () => {
  test('should complete the initial onboarding flow', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /start now/i }).click();

    await expect(page).toHaveURL(/\/children-safety-check/);

    await goToSafetyCheck(page);

    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/do-whats-best/);
  });

  test('should navigate to not-safe page when selecting unsafe option', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /start now/i }).click();

    await goToSafetyCheck(page);

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/not-safe/);
  });

  test('should handle number of children input', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    await goToSafetyCheck(page);
    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/number-of-children/);

    await page.getByLabel(/How many children is this for/i).fill('1');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/about-the-children/);
  });

  test('should validate form inputs and show errors', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    await goToSafetyCheck(page);
    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByLabel(/How many children is this for/i).fill('1');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: /continue/i }).click();

    const errorSummary = page.locator('.govuk-error-summary');
    await expect(errorSummary).toBeVisible();

    const errorMessage = page.locator('.govuk-error-message');
    await expect(errorMessage.first()).toBeVisible();
  });
});
