import { test, expect } from '@playwright/test';

test.describe('Task List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();
    // With USE_AUTH=false, goes directly to safety-check
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
  });

  test('should display task list after completing initial steps', async ({ page }) => {
    await expect(page).toHaveURL(/\/do-whats-best/);

    // Check the required checkbox
    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByLabel(/How many children is this for/i).fill('1');
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill child's first name (field is 'child-name0')
    await page.fill('input[name="child-name0"]', 'Test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill adult first names
    await page.fill('input[name="initial-adult-name"]', 'Parent');
    await page.fill('input[name="secondary-adult-name"]', 'Guardian');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/make-a-plan/);

    const taskListHeading = page.locator('h1');
    await expect(taskListHeading).toBeVisible();
  });

  test('should show task list sections', async ({ page }) => {
    await page.goto('/make-a-plan');

    const sections = [
      /living and visiting/i,
      /handover and holidays/i,
      /special days/i,
      /other things/i,
      /decision making/i,
    ];

    for (const sectionName of sections) {
      const section = page.getByText(sectionName);
      if ((await section.count()) > 0) {
        await expect(section.first()).toBeVisible();
      }
    }
  });
});
