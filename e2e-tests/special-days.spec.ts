import { test, expect } from '@playwright/test';

import { navigateToTaskList, expectErrorSummaryVisible } from './fixtures/test-helpers';

const FIELD_ID = 'special-days-0';
const ERROR_MESSAGE = 'Describe what you propose will happen on special days';
const SAMPLE_TEXT = 'Birthdays will be spent with the birthday child choosing which parent to be with. Christmas will alternate each year. School holidays will be split equally.';

test.describe('Special Days Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
  });

  test.describe('Navigation', () => {
    test('should navigate to special days from task list', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();

      await expect(page).toHaveURL(/\/special-days\/what-will-happen/);
      await expect(page.locator('h1')).toContainText('What will happen on special days?');
    });
  });

  test.describe('Empty Submission Validation', () => {
    test('should show error when submitting empty textarea', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGE);
    });

    test('should show error when submitting whitespace only', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.locator(`#${FIELD_ID}`).fill('   ');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGE);
    });
  });

  test.describe('Valid Input', () => {
    test('should accept free-text description and return to task list', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(SAMPLE_TEXT);
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
    });

    test('should accept short input', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.locator(`#${FIELD_ID}`).fill('Alternate holidays.');
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
    });

    test('should accept long detailed input', async ({ page }) => {
      const longText = `
        Birthdays: Each child's birthday will be celebrated with both parents present if possible.
        Christmas: Christmas Eve with one parent, Christmas Day with the other, alternating each year.
        Easter: Split between households, with Easter Sunday alternating.
        Summer holidays: Six weeks split into two three-week blocks.
        Half terms: Alternating between parents.
        Mother's Day and Father's Day: Children spend these days with the respective parent.
        Religious holidays: Respected according to each family's traditions.
      `.trim();

      await page.getByRole('link', { name: /special days/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(longText);
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
    });
  });

  test.describe('Do Not Need To Decide Option', () => {
    test('should allow skipping with "do not need to decide" option', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.getByRole('button', { name: /do not need to decide/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist entered text when navigating away and back', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(SAMPLE_TEXT);
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);

      // Navigate back to special days
      await page.getByRole('link', { name: /special days/i }).click();

      await expect(page.locator(`#${FIELD_ID}`)).toHaveValue(SAMPLE_TEXT);
    });

    test('should retain entered value after validation error', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();

      // First submit valid text
      await page.locator(`#${FIELD_ID}`).fill(SAMPLE_TEXT);
      await page.getByRole('button', { name: /continue/i }).click();

      // Go back and clear the field, then submit
      await page.getByRole('link', { name: /special days/i }).click();
      await page.locator(`#${FIELD_ID}`).fill('');
      await page.getByRole('button', { name: /continue/i }).click();

      // Should show error but stay on page
      await expectErrorSummaryVisible(page);
      await expect(page).toHaveURL(/\/special-days\/what-will-happen/);
    });
  });

  test.describe('Task List Status', () => {
    test('should show incomplete status before completing special days', async ({ page }) => {
      const specialDaysRow = page.locator('li').filter({ hasText: /special days/i });
      await expect(specialDaysRow).toContainText(/incomplete|cannot start/i);
    });

    test('should show completed status after submitting special days', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(SAMPLE_TEXT);
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);

      const specialDaysRow = page.locator('li').filter({ hasText: /special days/i });
      await expect(specialDaysRow).toContainText(/completed/i);
    });

    test('should show completed status after selecting "do not need to decide"', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.getByRole('button', { name: /do not need to decide/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);

      const specialDaysRow = page.locator('li').filter({ hasText: /special days/i });
      await expect(specialDaysRow).toContainText(/completed/i);
    });
  });

  test.describe('Error Display', () => {
    test('should display error summary with link to field', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);

      const errorLink = page.locator(`.govuk-error-summary__list a[href="#${FIELD_ID}-error"]`);
      await expect(errorLink).toBeVisible();
    });

    test('should apply error styling to textarea', async ({ page }) => {
      await page.getByRole('link', { name: /special days/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page.locator(`#${FIELD_ID}`)).toHaveClass(/govuk-textarea--error/);
    });
  });
});
