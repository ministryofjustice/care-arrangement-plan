import { test, expect } from '@playwright/test';
import { SafetyCheckPage } from './fixtures/page-objects';
import { navigateToTaskList } from './fixtures/test-helpers';

test.describe('User Journey with Page Objects', () => {
  test('should complete safety check using page objects', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    await expect(page).toHaveURL(/\/safety-check/);

    const safetyCheckPage = new SafetyCheckPage(page);
    await safetyCheckPage.selectYes();
    await safetyCheckPage.submit();

    await expect(page).toHaveURL(/\/children-safety-check/);
  });

  test('should navigate to task list using helper', async ({ page }) => {
    await navigateToTaskList(page);

    await expect(page).toHaveURL(/\/make-a-plan/);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});
