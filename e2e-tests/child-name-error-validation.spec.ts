import { test, expect } from '@playwright/test';

import {
  completeOnboardingFlow,
  expectErrorSummaryVisible,
  fillNumberOfChildren,
  fillNumberOfChildrenAndDetails,
  expectErrorSummaryLinkToField,
  expectFieldError
} from './fixtures/test-helpers';

const ERROR_ID = {
    child1: 'child-name0-error',
    child2: 'child-name1-error',
    child3: 'child-name2-error',
    child4: 'child-name3-error',
    child5: 'child-name4-error',
    child6: 'child-name5-error'
};

test.beforeEach(async ({ page }) => {
  await completeOnboardingFlow(page);
  await expect(page).toHaveURL(/\/number-of-children/);
});

test.describe('About the children Page Validation', () => {
    test('An error should be shown above an empty input', async ({ page }) => {
      await fillNumberOfChildren(page, 1)
      await page.getByRole('button', { name: /continue/i }).click();
      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${ERROR_ID.child1}`)).toContainText("Enter a first name");
    });

    test('An error should be shown for a whitespace input', async ({ page }) => {
      await fillNumberOfChildrenAndDetails(page, 1, [" "])
      await expect(page.locator(`#${ERROR_ID.child1}`)).toContainText("Enter a first name");
    });
});

  test.describe('Multiple Children Input Validation', () => {
    test('should show error that matches child input', async ({ page }) => {
        await fillNumberOfChildrenAndDetails(page, 6, ['', '', '', '', '', ''])
        await expect(page.locator(`#${ERROR_ID.child1}`)).toContainText("Enter a first name");
        await expect(page.locator(`#${ERROR_ID.child2}`)).toContainText("Enter a first name");
        await expect(page.locator(`#${ERROR_ID.child3}`)).toContainText("Enter a first name");
        await expect(page.locator(`#${ERROR_ID.child4}`)).toContainText("Enter a first name");
        await expect(page.locator(`#${ERROR_ID.child5}`)).toContainText("Enter a first name");
        await expect(page.locator(`#${ERROR_ID.child6}`)).toContainText("Enter a first name");
    });
});

  test.describe('Incomplete Inputs Valdiation', () => {
    test('should throw an error when not all have children have an input', async ({ page }) => {
       await fillNumberOfChildrenAndDetails(page, 2, ['Alice', ''])
       await expect(page.locator(`#${ERROR_ID.child2}`)).toContainText("Enter a first name");
    });
 });   

    test.describe('Error Summary Display', () => {
    test('should display error summary at the top of the page', async ({ page }) => {
      await fillNumberOfChildrenAndDetails(page, 1, [' '])
      await expectErrorSummaryVisible(page);
    });

    test('should display error summary link that links to the input field', async ({ page }) => {
      await fillNumberOfChildrenAndDetails(page, 1, [' '])
      await expectErrorSummaryLinkToField(page, 'child-name0');
    });

    test('should scroll to the input field when clicking the error summary link', async ({ page }) => {
      await fillNumberOfChildrenAndDetails(page, 1, [' '])
      await page.locator('.govuk-error-summary__list a').first().click();
      await expect(page.locator('#child-name0')).toBeInViewport();
    });
  });

  test.describe('Field Error Display', () => {
    test('should display error message next to the input field with correct styling', async ({ page }) => {
      await fillNumberOfChildrenAndDetails(page, 1, [' '])
      await expectFieldError(page, 'child-name0', "Enter a first name");
    });

    test('should apply error styling to the form group', async ({ page }) => {
      await fillNumberOfChildrenAndDetails(page, 1, [' '])
      const formGroup = page.locator('.govuk-form-group').first();
      await expect(formGroup).toHaveClass(/govuk-form-group--error/);
    });
  });

  test.describe('Error Message Accessibility', () => {
    test('should associate error message with input field via aria-describedby', async ({ page }) => {
      await fillNumberOfChildrenAndDetails(page, 1, [' '])
      const ariaDescribedby = await page.locator('#child-name0').getAttribute('aria-describedby');
      expect(ariaDescribedby).toContain('child-name0-error');
    });
  });

  test.describe('Form State Persistence', () => {
    test('should retain entered value after validation error', async ({ page }) => {
      await fillNumberOfChildrenAndDetails(page, 1, ['Alice'])
      await page.locator('.govuk-back-link').click();
      await expect(page.getByLabel(/First name of the child/i)).toHaveValue('Alice');
    });
  });
