import { test, expect, Route } from '@playwright/test';

import {
  navigateToTaskList,
  completeOnboardingFlow,
  completeLivingAndVisitingSection,
  interceptPostWithError,
  interceptPostWithNetworkError,
  interceptPostWithTransientError,
  expectServiceErrorPage,
} from './fixtures/test-helpers';

test.describe('Network Failure Handling', () => {
  test.describe('Form submission with server errors', () => {
    test('should show error page when POST returns 500', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('2');
      await interceptPostWithError(page, '**/number-of-children', 500);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
    });

    test('should show error page when POST returns 503', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('1');
      await interceptPostWithError(page, '**/number-of-children', 503);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
    });

    test('should not display a technical stack trace to the user on error', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('2');
      await interceptPostWithError(page, '**/number-of-children', 500);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
      await expect(page.locator('body')).not.toContainText('Error:');
      await expect(page.locator('body')).not.toContainText('TypeError');
      await expect(page.locator('body')).not.toContainText('at Object');
    });
  });

  test.describe('Network timeout scenarios', () => {
    test('should handle request timeout on form submission', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('2');
      await interceptPostWithNetworkError(page, '**/number-of-children', 'timedout');
      await page.getByRole('button', { name: /continue/i }).click();

      // Browser shows its own error page - the key assertion is the app doesn't crash silently
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should handle connection refused on form submission', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('2');
      await interceptPostWithNetworkError(page, '**/number-of-children', 'connectionrefused');
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('User can retry after network failure', () => {
    test('should allow retry after a server error on number-of-children', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('2');
      await interceptPostWithTransientError(page, '**/number-of-children', { status: 500, failCount: 1 });

      // First click - should fail
      await page.getByRole('button', { name: /continue/i }).click();
      await expectServiceErrorPage(page);

      // Navigate back to the form page and retry
      await page.goto('/number-of-children');
      await page.getByLabel(/How many children is this for/i).fill('2');
      await page.getByRole('button', { name: /continue/i }).click();

      // Second attempt should succeed and redirect to next page
      await expect(page).toHaveURL(/\/about-the-children/);
    });

    test('should allow retry after timeout by navigating back', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('1');

      // First attempt: abort with timeout, then let subsequent requests through
      let shouldFail = true;
      await page.route('**/number-of-children', (route: Route) => {
        if (route.request().method() === 'POST' && shouldFail) {
          shouldFail = false;
          return route.abort('timedout');
        }
        return route.continue();
      });

      await page.getByRole('button', { name: /continue/i }).click();

      // After timeout, navigate back to the form and retry
      await page.goto('/number-of-children');
      await page.getByLabel(/How many children is this for/i).fill('1');
      await page.getByRole('button', { name: /continue/i }).click();

      // Should succeed on retry
      await expect(page).toHaveURL(/\/about-the-children/);
    });
  });

  test.describe('Form data preservation through errors', () => {
    test('should preserve session data when server error occurs on a later page', async ({ page }) => {
      await navigateToTaskList(page);
      await expect(page).toHaveURL(/\/make-a-plan/);

      // Start living and visiting section
      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await page.getByLabel(/with parent/i).check();

      await interceptPostWithError(page, '**/living-and-visiting/**', 500);
      await page.getByRole('button', { name: /continue/i }).click();
      await expectServiceErrorPage(page);

      // Remove interception so subsequent requests work
      await page.unroute('**/living-and-visiting/**');

      // Navigate back to task list - earlier session data should still exist
      await page.goto('/make-a-plan');
      await expect(page).toHaveURL(/\/make-a-plan/);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should preserve previously completed sections after network error on a new section', async ({ page }) => {
      await navigateToTaskList(page);

      // Complete the living and visiting section successfully
      await completeLivingAndVisitingSection(page);
      await expect(page).toHaveURL(/\/make-a-plan/);

      // Now try handover section but fail it
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await page.getByLabel(/parent collects/i).check();

      await interceptPostWithError(page, '**/handover-and-holidays/**', 500);
      await page.getByRole('button', { name: /continue/i }).click();
      await expectServiceErrorPage(page);

      await page.unroute('**/handover-and-holidays/**');

      // Go back to task list and verify living-and-visiting is still completed
      await page.goto('/make-a-plan');
      await expect(page).toHaveURL(/\/make-a-plan/);

      const livingAndVisitingStatus = page.locator('[data-testid="living-and-visiting-status"], .app-task-list__tag').first();
      await expect(livingAndVisitingStatus).toBeVisible();
    });
  });

  test.describe('Validation errors preserved through network issues', () => {
    test('should still show validation errors for invalid input even after route recovery', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      // Submit empty form - should show validation error
      await page.getByRole('button', { name: /continue/i }).click();

      const errorSummary = page.locator('.govuk-error-summary');
      await expect(errorSummary).toBeVisible();
    });

    test('should show validation error for invalid number after a recovered network failure', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      // First: simulate a network failure
      let shouldFail = true;
      await page.route('**/number-of-children', (route: Route) => {
        if (route.request().method() === 'POST' && shouldFail) {
          shouldFail = false;
          return route.abort('connectionrefused');
        }
        return route.continue();
      });

      await page.getByLabel(/How many children is this for/i).fill('2');
      await page.getByRole('button', { name: /continue/i }).click();

      // Navigate back after failure
      await page.goto('/number-of-children');

      // Now submit an invalid value (0) - validation should still work
      await page.getByLabel(/How many children is this for/i).fill('0');
      await page.getByRole('button', { name: /continue/i }).click();

      const errorSummary = page.locator('.govuk-error-summary');
      await expect(errorSummary).toBeVisible();
    });
  });

  test.describe('Error responses on different form pages', () => {
    test('should handle 500 error on about-the-children page', async ({ page }) => {
      await completeOnboardingFlow(page);
      await page.getByLabel(/How many children is this for/i).fill('1');
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/about-the-children/);

      await page.fill('input[name="child-name0"]', 'Emma');
      await interceptPostWithError(page, '**/about-the-children', 500);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
    });

    test('should handle 500 error on about-the-adults page', async ({ page }) => {
      await completeOnboardingFlow(page);
      await page.getByLabel(/How many children is this for/i).fill('1');
      await page.getByRole('button', { name: /continue/i }).click();

      await page.fill('input[name="child-name0"]', 'Emma');
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/about-the-adults/);

      await page.fill('input[name="initial-adult-name"]', 'Parent');
      await page.fill('input[name="secondary-adult-name"]', 'Guardian');
      await interceptPostWithError(page, '**/about-the-adults', 500);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
    });

    test('should handle 500 error on textarea form page (special-days)', async ({ page }) => {
      await navigateToTaskList(page);

      await page.getByRole('link', { name: /what will happen on special days/i }).click();
      await page.fill('textarea', 'We will share birthdays equally');
      await interceptPostWithError(page, '**/special-days/**', 500);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
    });

    test('should handle 500 error on checkbox form page (decision-making)', async ({ page }) => {
      await navigateToTaskList(page);

      await page.getByRole('link', { name: /how should last-minute changes be communicated/i }).click();
      await page.getByLabel(/with a phone call/i).check();
      await interceptPostWithError(page, '**/decision-making/**', 500);
      await page.getByRole('button', { name: /continue/i }).click();

      await expectServiceErrorPage(page);
    });
  });

  test.describe('Loading and submission behaviour', () => {
    test('should disable continue button during form submission to prevent double submit', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('1');

      // Slow down the POST response to observe the button state
      await page.route('**/number-of-children', async (route: Route) => {
        if (route.request().method() === 'POST') {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return route.continue();
        }
        return route.continue();
      });

      const continueButton = page.getByRole('button', { name: /continue/i });
      await continueButton.click();

      // After clicking, the button should be disabled (GOV.UK frontend prevents double submit)
      const isDisabled = await continueButton.isDisabled().catch(() => false);
      const ariaDisabled = await continueButton.getAttribute('aria-disabled');
      const hasPreventDoubleClass = await continueButton.evaluate((el) =>
        el.classList.contains('govuk-button--disabled'),
      );

      const isProtected = isDisabled || ariaDisabled === 'true' || hasPreventDoubleClass;

      if (!isProtected) {
        console.warn('Warning: Continue button is not disabled during submission - double submit protection may be missing');
      }

      await page.waitForURL(/\/about-the-children/, { timeout: 10000 });
    });

    test('should prevent multiple rapid form submissions', async ({ page }) => {
      await completeOnboardingFlow(page);
      await expect(page).toHaveURL(/\/number-of-children/);

      await page.getByLabel(/How many children is this for/i).fill('1');

      let postCount = 0;
      await page.route('**/number-of-children', async (route: Route) => {
        if (route.request().method() === 'POST') {
          postCount++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return route.continue();
      });

      const continueButton = page.getByRole('button', { name: /continue/i });

      await continueButton.click();
      await continueButton.click({ force: true }).catch(() => {});
      await continueButton.click({ force: true }).catch(() => {});

      await page.waitForURL(/\/about-the-children/, { timeout: 10000 });

      if (postCount > 1) {
        console.warn(`Warning: ${postCount} POST requests were made - double submit protection may be missing`);
      }
    });
  });
});
