import { test, expect } from '@playwright/test';

import {
  completeOnboardingFlow,
  expectErrorSummaryVisible,
  expectFieldError,
  expectErrorSummaryLinkToField,
} from './fixtures/test-helpers';

const FIELD_ID = 'number-of-children';

const ERROR_MESSAGES = {
  empty: 'Enter how many children this agreement is for',
  tooFew: 'Your agreement must be for at least 1 child',
  tooMany: 'Your agreement cannot be for more than 6 children',
};

test.describe('Number of Children Page Validation', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboardingFlow(page);
    await expect(page).toHaveURL(/\/number-of-children/);
  });

  test.describe('Empty Input Validation', () => {
    test('should show error for empty input', async ({ page }) => {
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.empty);
    });

    test('should show error for whitespace only', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('   ');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.empty);
    });
  });

  test.describe('Non-Numeric Input Validation', () => {
    test('should show error for alphabetic input', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('abc');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.empty);
    });

    test('should show error for special characters', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('!@#');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.empty);
    });

    test('should show error for mixed alphanumeric', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('2a');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.empty);
    });

    test('should show error for decimal number', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('2.5');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.empty);
    });
  });

  test.describe('Minimum Value Validation', () => {
    test('should show error for zero', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('0');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.tooFew);
    });

    test('should show error for negative number', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('-1');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.tooFew);
    });

    test('should show error for large negative number', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('-100');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.tooFew);
    });
  });

  test.describe('Maximum Value Validation', () => {
    test('should show error for one above maximum', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('7');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.tooMany);
    });

    test('should show error for unrealistically large number', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('100');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.tooMany);
    });
  });

  test.describe('Valid Input', () => {
    // Note: Valid input with value "1" is already covered in journey-flow.spec.ts

    test('should accept 6 children (maximum boundary) and navigate to next page', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('6');
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page.locator('.govuk-error-summary')).not.toBeVisible();
      await expect(page).toHaveURL(/\/about-the-children/);
    });
  });

  test.describe('Error Summary Display', () => {
    test('should display error summary at the top of the page', async ({ page }) => {
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
    });

    test('should display error summary link that links to the input field', async ({ page }) => {
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryLinkToField(page, FIELD_ID);
    });

    test('should scroll to the input field when clicking the error summary link', async ({ page }) => {
      await page.getByRole('button', { name: /continue/i }).click();

      await page.locator('.govuk-error-summary__list a').first().click();

      await expect(page.locator(`#${FIELD_ID}`)).toBeInViewport();
    });
  });

  test.describe('Field Error Display', () => {
    test('should display error message next to the input field with correct styling', async ({ page }) => {
      await page.getByRole('button', { name: /continue/i }).click();

      await expectFieldError(page, FIELD_ID, ERROR_MESSAGES.empty);
    });

    test('should apply error styling to the form group', async ({ page }) => {
      await page.getByRole('button', { name: /continue/i }).click();

      const formGroup = page.locator('.govuk-form-group').first();
      await expect(formGroup).toHaveClass(/govuk-form-group--error/);
    });
  });

  test.describe('Error Message Accessibility', () => {
    test('should associate error message with input field via aria-describedby', async ({ page }) => {
      await page.getByRole('button', { name: /continue/i }).click();

      const ariaDescribedby = await page.locator(`#${FIELD_ID}`).getAttribute('aria-describedby');
      expect(ariaDescribedby).toContain(`${FIELD_ID}-error`);
    });
  });

  test.describe('Form State Persistence', () => {
    test('should retain entered value after validation error', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('0');
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page.locator('.govuk-error-summary')).toBeVisible();
      await expect(page.getByLabel(/How many children/i)).toHaveValue('0');
    });

    test('should retain entered value for invalid non-numeric input', async ({ page }) => {
      await page.getByLabel(/How many children/i).fill('abc');
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page.locator('.govuk-error-summary')).toBeVisible();
      await expect(page.getByLabel(/How many children/i)).toHaveValue('abc');
    });
  });
});
