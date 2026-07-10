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

  test('should render the not-safe support content and continue to do-whats-best', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /start now/i }).click();

    await goToSafetyCheck(page);

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/not-safe/);
    await expect(page.locator('h1')).toContainText('Getting help if you have experienced abuse');
    await expect(page.getByText(/This service may not be right for you if you/i)).toBeVisible();
    await expect(page.getByText(/If you are in immediate danger, call 999 and ask for the police/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Get help protecting yourself and your children/i })).toBeVisible();
    await expect(page.getByText(/recognise domestic abuse/i)).toBeVisible();
    await expect(page.getByText(/get a court order to protect you or your child/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Help and support/i })).toBeVisible();
    await expect(page.getByText(/There is free, confidential support available to help you and your family/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Refuge National Domestic Abuse Helpline/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Rights of Women/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Men's Advice Line/i })).toBeVisible();

    await page.locator('a[href="/do-whats-best"]').click();

    await expect(page).toHaveURL(/\/do-whats-best/);
  });

  test('should render the children not-safe support content and continue to safety check', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /start now/i }).click();

    await expect(page).toHaveURL(/\/children-safety-check/);

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/children-not-safe/);
    await expect(page.locator('h1')).toContainText('Getting help if your children are not safe');
    await expect(page.getByText(/It may not be appropriate to make child arrangements/i)).toBeVisible();
    await expect(page.getByText(/If a child is in immediate danger, call 999 and ask for the police/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Get help protecting your children/i })).toBeVisible();
    await expect(page.getByText(/It is important to remember that there is help and support available/i)).toBeVisible();
    await expect(page.getByText(/get a court order to protect you or your child/i)).toBeVisible();
    await expect(page.getByText(/what to do if you believe a child could be taken/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Help and support/i })).toBeVisible();
    await expect(page.getByText(/There is free, confidential support available to help you and your family/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Refuge National Domestic Abuse Helpline/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Rights of Women/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Reunite International Child Abduction Centre/i })).toBeVisible();

    await page.locator('a[href="/safety-check"]').click();

    await expect(page).toHaveURL(/\/safety-check/);
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
