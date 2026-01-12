import { test, expect } from '@playwright/test';

import { navigateToTaskList, fillAllChildrenAndContinue, generateTestChildData } from './fixtures/test-helpers';

test.describe('Complete User Journey', () => {
  test('should complete the full journey to task list', async ({ page }) => {
    await navigateToTaskList(page);

    await expect(page).toHaveURL(/\/make-a-plan/);

    const heading = page.locator('h1');
    await expect(heading).toContainText(/child arrangements plan/i);
  });

  test('should handle multiple children', async ({ page }) => {
    // Navigate through flow to get to number-of-children
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

    // Now at number-of-children
    await page.getByLabel(/How many children is this for/i).fill('3');
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill all 3 children's first names
    const childNames = [];
    for (let i = 0; i < 3; i++) {
      const childData = generateTestChildData(i);
      childNames.push(childData.firstName);
    }
    await fillAllChildrenAndContinue(page, childNames);

    await expect(page).toHaveURL(/\/about-the-adults/);
  });

  test('should persist data when returning to task list', async ({ page }) => {
    await navigateToTaskList(page);

    await expect(page).toHaveURL(/\/make-a-plan/);

    await page.goto('/about-the-children');

    // Check that the first child's name persisted (field is 'child-name0')
    const firstNameInput = page.locator('input[name="child-name0"]');
    const value = await firstNameInput.inputValue();
    expect(value).toBe('Test');
  });
});
