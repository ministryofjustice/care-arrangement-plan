import { test, expect } from '@playwright/test';

import {
  completeOnboardingFlow,
  expectErrorSummaryVisible,
  fillNumberOfChildrenAndDetails,
  expectErrorSummaryLinkToField,
  fillAdultDetails,
  expectFieldError
} from './fixtures/test-helpers';

test.beforeEach(async ({ page }) => {
  await completeOnboardingFlow(page);
  await fillNumberOfChildrenAndDetails(page, 1, ["child1"])
  await expect(page).toHaveURL(/\/about-the-adults/);
});

test.describe('About the adults Page Validation', () => {
    test('An error should be shown for an empty input', async ({ page }) => {
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page.locator('#initial-adult-name-error')).toContainText("Enter your first name or the name of the person you represent");
      await expect(page.locator('#secondary-adult-name-error')).toContainText("Enter the name of the other parent or carer");
    });

    test('An error should be shown for a whitespace input', async ({ page }) => {
      await fillAdultDetails(page, '', '')
      await expect(page.locator('#initial-adult-name-error')).toContainText("Enter your first name or the name of the person you represent");
      await expect(page.locator('#secondary-adult-name-error')).toContainText("Enter the name of the other parent or carer");
    });

    test('An error should be shown when one adults name is missing', async ({ page }) => {
      await fillAdultDetails(page, 'adult1', '')
      await expect(page.locator('#secondary-adult-name-error')).toContainText("Enter the name of the other parent or carer");
    });

    test('An error should be shown when adult names are the same', async ({ page }) => {
      await fillAdultDetails(page, 'adult1', 'adult1')
      await expect(page.locator('#secondary-adult-name-error')).toContainText("Enter a way to tell the adults apart");
    });
});

test.describe('Error Summary Display', () => {
    test('should display error summary at the top of the page', async ({ page }) => {
      await fillAdultDetails(page, '', '')
      await expectErrorSummaryVisible(page);
    });

    test('should display error summary link that links to the input field', async ({ page }) => {
      await fillAdultDetails(page, '', '')
      await expectErrorSummaryLinkToField(page, 'initial-adult-name-error')
      const errorLink = page.locator(`.govuk-error-summary__list a[href="#secondary-adult-name-error"]`).filter({ hasText: 'Enter the name of the other parent or carer' });
      await expect(errorLink).toBeVisible();
    });

    test('should scroll to the input field when clicking the error summary link', async ({ page }) => {
      await fillAdultDetails(page, '', '')
      await page.locator('.govuk-error-summary__list a').nth(0).click();
      await expect(page.locator('#initial-adult-name')).toBeInViewport();
      await page.locator('.govuk-error-summary__list a').nth(1).click();
      await expect(page.locator('#secondary-adult-name')).toBeInViewport();
      await page.locator('.govuk-error-summary__list a').nth(2).click();
      await expect(page.locator('#secondary-adult-name')).toBeInViewport();
    });
});

test.describe('Field Error Display', () => {
    test('should display error message next to the input field with correct styling', async ({ page }) => {
      await fillAdultDetails(page, '', '')
      await expectFieldError(page, 'initial-adult-name', "Enter your first name or the name of the person you represent");
      await expectFieldError(page, 'secondary-adult-name', "Enter the name of the other parent or carer");
    });

    test('should apply error styling to the form group', async ({ page }) => {
      await fillAdultDetails(page, '', '')
      const formGroupInitalAdult = page.locator('.govuk-form-group').nth(0);
      await expect(formGroupInitalAdult).toHaveClass(/govuk-form-group--error/);
      const formGroupSecondaryAdult = page.locator('.govuk-form-group').nth(1);
      await expect(formGroupSecondaryAdult).toHaveClass(/govuk-form-group--error/);
    });
});

test.describe('Error Message Accessibility', () => {
    test('should associate error message with input field via aria-describedby', async ({ page }) => {
      await fillAdultDetails(page, '', '')
      const ariaDescribedbyInitialAdult = await page.locator('#initial-adult-name').getAttribute('aria-describedby');
      expect(ariaDescribedbyInitialAdult).toContain('initial-adult-name-error');
      const ariaDescribedbySecondaryAdult = await page.locator('#secondary-adult-name').getAttribute('aria-describedby');
      expect(ariaDescribedbySecondaryAdult).toContain('secondary-adult-name-error');
    });
});

test.describe('Form State Persistence', () => {
    test('should retain entered value after validation error', async ({ page }) => {
      await fillAdultDetails(page, 'adult1', 'adult2')
      await page.getByRole('link', { name: 'Who is using this service?' }).click();
      await expect(page.getByLabel(/Your first name/i)).toHaveValue('adult1');
      await expect(page.getByLabel(/First name of the other parent or carer/i)).toHaveValue('adult2');
    });
});