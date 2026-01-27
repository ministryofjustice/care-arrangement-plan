import { test, expect } from '@playwright/test';

import { verifyServiceBackLink } from './fixtures/navigation-helpers';
import { taskListSections, staticPages } from './fixtures/test-data';
import {
  startJourney,
  completeSafetyChecks,
  completeOnboardingFlow,
  fillNumberOfChildren,
  fillAllChildrenAndContinue,
  navigateToTaskList,
} from './fixtures/test-helpers';

/**
 * TODO: Radio buttons and checkboxes don't remember their state when using the service Back link
 *
 * When clicking the service Back link (.govuk-back-link), radio button and checkbox selections
 * are not pre-filled, even though the data is saved in session. This is because most routes
 * don't pass the saved values back to the view as formValues.
 *
 * Text inputs (like names) do get pre-filled because those routes pass formValues from session.
 *
 * Consider updating routes to pre-fill radio buttons/checkboxes from session data for better UX.
 */

test.describe('Service Back Link Navigation - Onboarding Flow', () => {
  test('should navigate back from children-safety-check to safety-check', async ({ page }) => {
    await startJourney(page);

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Click back - radio button selection won't be pre-filled (see TODO above)
    await page.locator('.govuk-back-link').click();
    await expect(page).toHaveURL(/\/safety-check/);

    // Verify page loaded without errors
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Note: Radio button is NOT pre-filled because safetyCheck route doesn't pass formValues
    // This is the current behavior - users would need to re-select their answer

    // Verify we can proceed forward
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/children-safety-check/);
  });

  test('should navigate back from do-whats-best to children-safety-check', async ({ page }) => {
    await startJourney(page);
    await completeSafetyChecks(page);

    // Click back - radio button won't be pre-filled
    await page.locator('.govuk-back-link').click();
    await expect(page).toHaveURL(/\/children-safety-check/);

    // Verify page loaded
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Re-select and proceed forward
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/do-whats-best/);
  });

  test('should navigate back from court-order-check to do-whats-best', async ({ page }) => {
    await startJourney(page);
    await completeSafetyChecks(page);

    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Click back - checkbox won't be pre-filled
    await page.locator('.govuk-back-link').click();
    await expect(page).toHaveURL(/\/do-whats-best/);

    // Verify page loaded
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should navigate back from number-of-children to court-order-check', async ({ page }) => {
    await completeOnboardingFlow(page);

    // Click back - radio button won't be pre-filled
    await page.locator('.govuk-back-link').click();
    await expect(page).toHaveURL(/\/court-order-check/);

    // Verify page loaded
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should navigate back from about-the-children - UNSAVED data is NOT preserved', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    // Fill form but DON'T submit
    await page.fill('input[name="child-name0"]', 'UnsavedName');

    // Click back without submitting
    await page.locator('.govuk-back-link').click();
    await expect(page).toHaveURL(/\/number-of-children/);

    // Navigate forward again
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/about-the-children/);

    // Unsaved data should NOT be preserved (field should be empty or have old value from session)
    const childNameInput = page.locator('input[name="child-name0"]');
    await expect(childNameInput).not.toHaveValue('UnsavedName');
  });

  test('should navigate back from about-the-children - SUBMITTED data IS preserved', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    // Fill AND SUBMIT the form
    await page.fill('input[name="child-name0"]', 'Alice');
    await page.getByRole('button', { name: /continue/i }).click();

    // Now on about-the-adults page, click back
    await page.locator('.govuk-back-link').click();
    await expect(page).toHaveURL(/\/about-the-children/);

    // Submitted data should be pre-filled from session
    const childNameInput = page.locator('input[name="child-name0"]');
    await expect(childNameInput).toHaveValue('Alice');
  });

  test('should navigate back from about-the-adults with multiple children data', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 3);

    const childNames = ['Alice', 'Bob', 'Charlie'];
    await fillAllChildrenAndContinue(page, childNames);

    await verifyServiceBackLink(
      page,
      /\/about-the-children/,
      async () => {
        for (let i = 0; i < childNames.length; i++) {
          const input = page.locator(`input[name="child-name${i}"]`);
          await expect(input).toHaveValue(childNames[i]);
        }
      }
    );
  });

});

test.describe('Service Back Link Navigation - Alternative Paths', () => {
  test('should navigate back from not-safe page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Click back - radio button won't be pre-filled
    await page.locator('.govuk-back-link').click();
    await expect(page).toHaveURL(/\/safety-check/);

    // Verify page loaded
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Change answer and verify different path
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/children-safety-check/);
  });

  test('should navigate back from children-not-safe page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Click back - radio button won't be pre-filled
    await page.locator('.govuk-back-link').click();
    await expect(page).toHaveURL(/\/children-safety-check/);

    // Verify page loaded
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

});

test.describe('Service Back Link Navigation - Validation Errors', () => {
  test('should navigate back from about-the-children validation error', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    // Submit without filling to trigger error
    await page.getByRole('button', { name: /continue/i }).click();

    const errorSummary = page.locator('.govuk-error-summary');
    await expect(errorSummary).toBeVisible();

    // Click the service's "Back" link (GOV.UK back link in page header)
    await verifyServiceBackLink(
      page,
      /\/number-of-children/,
      async () => {
        const numberInput = page.getByLabel(/How many children is this for/i);
        await expect(numberInput).toHaveValue('1');
      }
    );

    // Navigate forward again
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/about-the-children/);

    // Now fill correctly
    await page.fill('input[name="child-name0"]', 'ValidName');
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/about-the-adults/);
  });

  test('should navigate back from about-the-adults validation error', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);
    await fillAllChildrenAndContinue(page, ['Alice']);

    // Submit without filling to trigger error
    await page.getByRole('button', { name: /continue/i }).click();

    const errorSummary = page.locator('.govuk-error-summary');
    await expect(errorSummary).toBeVisible();

    await verifyServiceBackLink(
      page,
      /\/about-the-children/,
      async () => {
        const childInput = page.locator('input[name="child-name0"]');
        await expect(childInput).toHaveValue('Alice');
      }
    );
  });
});

test.describe('Service Back Link Navigation - Task List Sections', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
  });

  for (const section of taskListSections) {
    test(`should navigate back to task list from ${section.name}`, async ({ page }) => {
      await page.goto(section.path);

      await verifyServiceBackLink(page, /\/make-a-plan/);

      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });
  }
});

test.describe('Service Back Link Navigation - Static Pages', () => {
  for (const staticPage of staticPages) {
    test(`should navigate back from ${staticPage.name}`, async ({ page }) => {
      await page.goto('/');
      await page.goto(staticPage.path);

      await expect(page).toHaveURL(new RegExp(staticPage.path));

      await verifyServiceBackLink(page, /\/$/);
    });
  }
});

/**
 * Tests for service back link navigation when flash messages are displayed.
 *
 * These tests verify that the .govuk-back-link works correctly when users see:
 * - "Your progress was not saved. Please submit this page to continue."
 * - "You need to complete this page before continuing."
 *
 * The setupHistory middleware sets previousPage correctly even after redirects.
 */
test.describe('Service Back Link Navigation - Flash Message Redirects', () => {
  test('should allow service back link when redirected with "complete this page" message', async ({ page }) => {
    // Start journey and complete only the first step
    await startJourney(page);
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Now at children-safety-check, try to jump ahead to about-the-children
    await page.goto('/about-the-children');

    // Should be redirected with flash message
    const flashMessage = page.locator('.govuk-notification-banner__heading');
    await expect(flashMessage).toContainText('You need to complete this page before continuing');

    // Verify we were redirected (not on about-the-children)
    await expect(page).not.toHaveURL(/\/about-the-children/);

    // Use service back link - should go to previous page in history (safety-check)
    await verifyServiceBackLink(page, /\/safety-check/);
  });

  test('should allow service back link when redirected from task list sections', async ({ page }) => {
    await navigateToTaskList(page);

    // Try to jump to a page that requires completing the first question in the section
    await page.goto('/living-and-visiting/will-overnights-happen');

    // Should be redirected with flash message
    const flashMessage = page.locator('.govuk-notification-banner__heading');
    await expect(flashMessage).toContainText('You need to complete this page before continuing');

    // Should be redirected to mostly-live page (the prerequisite)
    await expect(page).toHaveURL(/\/living-and-visiting\/where-will-the-children-mostly-live/);

    // Use service back link - should go back to task list
    await verifyServiceBackLink(page, /\/make-a-plan/);
  });

  test('should allow service back link when redirected within a section flow', async ({ page }) => {
    await navigateToTaskList(page);

    // Start the decision-making section and complete the first page
    await page.goto('/decision-making/plan-last-minute-changes');
    await page.getByRole('checkbox').first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Now on plan-long-term-notice, go back to task list without completing
    await page.goto('/make-a-plan');

    // Try to jump to the third page in the section (skipping long-term-notice completion)
    await page.goto('/decision-making/plan-review');

    // Should be redirected with flash message
    const flashMessage = page.locator('.govuk-notification-banner__heading');
    await expect(flashMessage).toBeVisible();

    // Should be on plan-long-term-notice (the prerequisite)
    await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);

    // Use service back link - should go back to task list
    await verifyServiceBackLink(page, /\/decision-making\/plan-last-minute-changes/);
  });

  test('should allow service back link after multiple redirects', async ({ page }) => {
    await completeOnboardingFlow(page);

    // Try to jump ahead
    await page.goto('/about-the-children');

    // Should be redirected with flash message to number-of-children
    const flashMessage = page.locator('.govuk-notification-banner__heading');
    await expect(flashMessage).toContainText('You need to complete this page before continuing');
    await expect(page).toHaveURL(/\/number-of-children/);

    // Use service back link - should go to court-order-check
    await verifyServiceBackLink(page, /\/court-order-check/);
  });
});
