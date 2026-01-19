import { test, expect } from '@playwright/test';

test.describe('User Journey Flow', () => {
  test('should complete the initial onboarding flow', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /start now/i }).click();

    // With USE_AUTH=false, goes directly to safety-check
    await expect(page).toHaveURL(/\/safety-check/);

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/children-safety-check/);

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/do-whats-best/);
  });

  test('should navigate to not-safe page when selecting unsafe option', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /start now/i }).click();

    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/not-safe/);
  });

  test('should handle number of children input', async ({ page }) => {
    // Navigate through the flow to get to number-of-children
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

    // Now we should be at number-of-children
    await expect(page).toHaveURL(/\/number-of-children/);

    await page.getByLabel(/How many children is this for/i).fill('1');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/about-the-children/);
  });

  test('should validate form inputs and show errors', async ({ page }) => {
    // Navigate through the flow to get to about-the-children
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

    // Enter 1 child
    await page.getByLabel(/How many children is this for/i).fill('1');
    await page.getByRole('button', { name: /continue/i }).click();

    // Now submit form without filling it
    await page.getByRole('button', { name: /continue/i }).click();

    const errorSummary = page.locator('.govuk-error-summary');
    await expect(errorSummary).toBeVisible();

    const errorMessage = page.locator('.govuk-error-message');
    await expect(errorMessage.first()).toBeVisible();
  });
});
