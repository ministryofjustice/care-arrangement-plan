import { test, expect } from '@playwright/test';

import { goToSafetyCheck, startJourney } from './fixtures/test-helpers';

test.describe('Accessibility', () => {
  test('should have proper heading structure on homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /making child arrangements if you divorce or separate/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /make a child arrangements plan/i })).toBeVisible();

    await expect(page.getByRole('heading', { level: 2, name: /what the plan includes/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /make your plan/i })).toBeVisible();
  });

  test('should have a single page heading on safety check', async ({ page }) => {
    await startJourney(page);
    await goToSafetyCheck(page);

    await expect(page).toHaveURL(/\/safety-check/);
    await expect(page.getByRole('heading', { level: 1, name: /Have you experienced abuse from your ex-partner?/i })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('should have accessible form labels on safety check', async ({ page }) => {
    await startJourney(page);
    await goToSafetyCheck(page);

    const yesRadio = page.getByLabel(/yes/i).first();
    const noRadio = page.getByLabel(/no/i).first();

    await expect(yesRadio).toBeVisible();
    await expect(noRadio).toBeVisible();
    await expect(yesRadio).toHaveAttribute('type', 'radio');
    await expect(noRadio).toHaveAttribute('type', 'radio');

    await expect(page.getByText(/Select whether you have experienced abuse from your ex-partner/i)).toBeVisible();
  });

  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('.govuk-skip-link');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    const mainContent = page.locator('#main-content, main');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have proper button and link roles on homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: /start now/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /cookies/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /accessibility/i })).toBeVisible();
  });

  test('should expose exit this page control on safety check', async ({ page }) => {
    await startJourney(page);
    await goToSafetyCheck(page);

    await expect(page.getByRole('button', { name: /exit this page/i })).toBeVisible();
  });

  test('should announce escape key shortcut to screen readers on safety check', async ({ page }) => {
    await startJourney(page);
    await goToSafetyCheck(page);

    const liveRegion = page.locator('[role="status"][aria-live="polite"]');
    await expect(liveRegion).toBeVisible();
    await expect(liveRegion).toContainText(/press escape three times/i);
  });

  test('should set the document language', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('should offer a Welsh language link on the homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /welsh \(cymraeg\)/i })).toBeVisible();
  });
});
