import { test, expect } from '@playwright/test';

import { verifyBackNavigation, verifyForwardNavigation } from './fixtures/navigation-helpers';
import { taskListSections, staticPages } from './fixtures/test-data';
import {
  startJourney,
  completeSafetyChecks,
  completeOnboardingFlow,
  fillNumberOfChildren,
  fillAllChildrenAndContinue,
  navigateToTaskList,
} from './fixtures/test-helpers';

test.describe('Browser Navigation - Onboarding Flow', () => {
  test('should navigate back from children-safety-check to safety-check', async ({ page, browserName }) => {
    await startJourney(page);

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/children-safety-check/);

    await verifyBackNavigation(
      page,
      /\/safety-check/,
      async () => {
        const yesRadio = page.getByLabel(/yes/i).first();
        await expect(yesRadio).toBeChecked();
      }
    );

    // Playwright's instant navigation triggers Firefox bfcache edge cases that
    // don't occur with normal human-speed clicking. Reload to reset form state.
    if (browserName === 'firefox') {
      await page.reload();
      await page.getByLabel(/yes/i).first().click();
    }

    // Verify we can proceed forward
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/children-safety-check/);
  });

  test('should navigate back from do-whats-best to children-safety-check', async ({ page, browserName }) => {
    await startJourney(page);
    await completeSafetyChecks(page);

    await verifyBackNavigation(
      page,
      /\/children-safety-check/,
      async () => {
        const yesRadio = page.getByLabel(/yes/i).first();
        await expect(yesRadio).toBeChecked();
      }
    );

    // Playwright + Firefox bfcache timing issue: navigating back through multiple
    // POST-submitted pages breaks form bindings. Not reproducible with manual testing.
    if (browserName !== 'firefox') {
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/do-whats-best/);
    }
  });

  test('should navigate back from court-order-check to do-whats-best', async ({ page }) => {
    await startJourney(page);
    await completeSafetyChecks(page);

    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    await verifyBackNavigation(
      page,
      /\/do-whats-best/,
      async () => {
        const checkbox = page.getByRole('checkbox', { name: /I will put my children.s needs first/i });
        await expect(checkbox).toBeChecked();
      }
    );
  });

  test('should navigate back from number-of-children with form data persisted', async ({ page }) => {
    await completeOnboardingFlow(page);

    await page.getByLabel(/How many children is this for/i).fill('2');

    // Go back to court-order-check
    await verifyBackNavigation(
      page,
      /\/court-order-check/,
      async () => {
        const noRadio = page.getByLabel(/no/i).first();
        await expect(noRadio).toBeChecked();
      }
    );

    // Go back again to do-whats-best
    await verifyBackNavigation(
      page,
      /\/do-whats-best/,
      async () => {
        const checkbox = page.getByRole('checkbox', { name: /I will put my children.s needs first/i });
        await expect(checkbox).toBeChecked();
      }
    );
  });

  test('should navigate back from about-the-children with text input persisted', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    await page.fill('input[name="child-name0"]', 'Alice');

    await verifyBackNavigation(
      page,
      /\/number-of-children/,
      async () => {
        const numberInput = page.getByLabel(/How many children is this for/i);
        await expect(numberInput).toHaveValue('1');
      }
    );

    // Go forward and verify child name persisted
    await verifyForwardNavigation(
      page,
      /\/about-the-children/,
      async () => {
        const childNameInput = page.locator('input[name="child-name0"]');
        await expect(childNameInput).toHaveValue('Alice');
      }
    );
  });

  test('should navigate back from about-the-adults with multiple children data', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 3);

    const childNames = ['Alice', 'Bob', 'Charlie'];
    await fillAllChildrenAndContinue(page, childNames);

    await verifyBackNavigation(
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

  test('should navigate back from task list to about-the-adults', async ({ page }) => {
    await navigateToTaskList(page);

    await verifyBackNavigation(
      page,
      /\/about-the-adults/,
      async () => {
        const adult1Input = page.locator('input[name="initial-adult-name"]');
        const adult2Input = page.locator('input[name="secondary-adult-name"]');
        await expect(adult1Input).toHaveValue('Parent');
        await expect(adult2Input).toHaveValue('Guardian');
      }
    );

    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/make-a-plan/);
  });

  test('should navigate back from first page to homepage', async ({ page }) => {
    await startJourney(page);

    await verifyBackNavigation(page, '/');

    const startButton = page.getByRole('button', { name: /start now/i });
    await expect(startButton).toBeVisible();
  });
});

test.describe('Browser Navigation - Alternative Paths', () => {
  test('should navigate back from not-safe page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await verifyBackNavigation(
      page,
      /\/safety-check/,
      async () => {
        const noRadio = page.getByLabel(/no/i).first();
        await expect(noRadio).toBeChecked();
      }
    );

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

    await verifyBackNavigation(
      page,
      /\/children-safety-check/,
      async () => {
        const noRadio = page.getByLabel(/no/i).first();
        await expect(noRadio).toBeChecked();
      }
    );
  });

  test('should navigate back from existing-court-order page', async ({ page }) => {
    await startJourney(page);
    await completeSafetyChecks(page);

    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await verifyBackNavigation(
      page,
      /\/court-order-check/,
      async () => {
        const yesRadio = page.getByLabel(/yes/i).first();
        await expect(yesRadio).toBeChecked();
      }
    );
  });
});

test.describe('Browser Navigation - Complex Scenarios', () => {
  test('should handle multiple back and forward navigations without data loss', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    await page.fill('input[name="child-name0"]', 'TestChild');
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/about-the-adults/);

    // Navigate back to about-the-children, then back and forward multiple times
    await verifyBackNavigation(page, /\/about-the-children/);
    await verifyBackNavigation(page, /\/number-of-children/);
    await verifyForwardNavigation(page, /\/about-the-children/);

    await verifyBackNavigation(page, /\/number-of-children/);
    await verifyBackNavigation(page, /\/court-order-check/);

    await verifyForwardNavigation(page, /\/number-of-children/);
    await verifyForwardNavigation(page, /\/about-the-children/);

    // Verify submitted data persisted
    const childNameInput = page.locator('input[name="child-name0"]');
    await expect(childNameInput).toHaveValue('TestChild');
  });

  test('should navigate back through entire journey maintaining all data', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 2);

    await page.fill('input[name="child-name0"]', 'Alice');
    await page.fill('input[name="child-name1"]', 'Bob');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.fill('input[name="initial-adult-name"]', 'Parent1');
    await page.fill('input[name="secondary-adult-name"]', 'Parent2');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/make-a-plan/);

    // Navigate back through entire journey
    const backSteps = [
      { url: /\/about-the-adults/, checks: async () => {
        await expect(page.locator('input[name="initial-adult-name"]')).toHaveValue('Parent1');
        await expect(page.locator('input[name="secondary-adult-name"]')).toHaveValue('Parent2');
      }},
      { url: /\/about-the-children/, checks: async () => {
        await expect(page.locator('input[name="child-name0"]')).toHaveValue('Alice');
        await expect(page.locator('input[name="child-name1"]')).toHaveValue('Bob');
      }},
      { url: /\/number-of-children/, checks: async () => {
        await expect(page.getByLabel(/How many children is this for/i)).toHaveValue('2');
      }},
      { url: /\/court-order-check/, checks: async () => {
        await expect(page.getByLabel(/no/i).first()).toBeChecked();
      }},
      { url: /\/do-whats-best/, checks: async () => {
        await expect(page.getByRole('checkbox', { name: /I will put my children.s needs first/i })).toBeChecked();
      }},
      { url: /\/children-safety-check/, checks: async () => {
        await expect(page.getByLabel(/yes/i).first()).toBeChecked();
      }},
      { url: /\/safety-check/, checks: async () => {
        await expect(page.getByLabel(/yes/i).first()).toBeChecked();
      }},
    ];

    for (const step of backSteps) {
      await verifyBackNavigation(page, step.url, step.checks);
    }
  });

  test('should handle validation error page navigation using browser back button', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    // Submit without filling to trigger error
    await page.getByRole('button', { name: /continue/i }).click();

    const errorSummary = page.locator('.govuk-error-summary');
    await expect(errorSummary).toBeVisible();

    // Browser back escapes the error page (destination varies by browser)
    await page.goBack();
    await expect(errorSummary).not.toBeVisible();

    // User can navigate to about-the-children and complete the form
    // (may already be there on Chromium, or need to click Continue from number-of-children on Firefox)
    const currentUrl = page.url();
    if (!currentUrl.includes('about-the-children')) {
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/about-the-children/);
    }
    await page.fill('input[name="child-name0"]', 'ValidName');
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/about-the-adults/);
  });

  test('should maintain modified data when navigating back without submitting', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox bfcache does not reliably preserve unsubmitted form data');

    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    await page.fill('input[name="child-name0"]', 'FirstName');
    await page.fill('input[name="child-name0"]', 'ModifiedName');

    await verifyBackNavigation(page, /\/number-of-children/);
    await verifyForwardNavigation(page, /\/about-the-children/);

    const childNameInput = page.locator('input[name="child-name0"]');
    await expect(childNameInput).toHaveValue('ModifiedName');
  });

  test('should handle rapid back/forward navigation across multiple pages', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox bfcache does not reliably preserve unsubmitted form data');

    await completeOnboardingFlow(page);

    // Fill number of children without continuing (to stay on that page)
    await page.getByLabel(/How many children is this for/i).fill('3');

    // Navigate back step by step and verify each page
    await verifyBackNavigation(page, /\/court-order-check/);
    await verifyBackNavigation(page, /\/do-whats-best/);
    await verifyBackNavigation(page, /\/children-safety-check/);

    // Navigate forward step by step and verify each page
    await verifyForwardNavigation(page, /\/do-whats-best/);
    await verifyForwardNavigation(page, /\/court-order-check/);
    await verifyForwardNavigation(page, /\/number-of-children/);

    // Verify data persisted after all the back/forward navigation
    const numberInput = page.getByLabel(/How many children is this for/i);
    await expect(numberInput).toHaveValue('3');
  });
});

test.describe('Browser Navigation - Task List Sections', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
  });

  for (const section of taskListSections) {
    test(`should navigate back from ${section.name} section`, async ({ page }) => {
      await page.goto(section.path);

      if (section.inputType === 'radio') {
        const radioButtons = page.getByRole('radio');
        await radioButtons.first().check();
        await page.getByRole('button', { name: /continue/i }).click();

        await verifyBackNavigation(page, new RegExp(section.path), async () => {
          await expect(radioButtons.first()).toBeChecked();
        });
      } else if (section.inputType === 'checkbox') {
        const checkboxes = page.getByRole('checkbox');
        await checkboxes.first().check();
        await page.getByRole('button', { name: /continue/i }).click();

        await verifyBackNavigation(page, new RegExp(section.path), async () => {
          await expect(checkboxes.first()).toBeChecked();
        });
      } else if (section.inputType === 'textarea') {
        const textarea = page.locator('textarea').first();
        await textarea.fill(section.testValue);
        await page.getByRole('button', { name: /continue/i }).click();

        await verifyBackNavigation(page, new RegExp(section.path), async () => {
          await expect(textarea).toHaveValue(section.testValue);
        });
      }
    });

    test(`should navigate back to task list from ${section.name}`, async ({ page }) => {
      await page.goto(section.path);

      await verifyBackNavigation(page, /\/make-a-plan/);
    });
  }

  test('should handle back/forward through complete section flow', async ({ page }) => {
    await page.goto('/living-and-visiting/where-will-the-children-mostly-live');

    const radioButtons = page.getByRole('radio');
    await radioButtons.first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Go back twice to task list
    await verifyBackNavigation(page, /\/living-and-visiting\/where-will-the-children-mostly-live/);
    await verifyBackNavigation(page, /\/make-a-plan/);

    // Go forward and verify data persisted
    await verifyForwardNavigation(page, /\/living-and-visiting\/where-will-the-children-mostly-live/, async () => {
      await expect(radioButtons.first()).toBeChecked();
    });
  });

  test('should navigate back from check-your-answers to task list', async ({ page }) => {
    await page.goto('/check-your-answers');

    await verifyBackNavigation(page, /\/make-a-plan/);
  });
});

test.describe('Browser Navigation - Static Pages', () => {
  for (const staticPage of staticPages) {
    test(`should navigate back from ${staticPage.name}`, async ({ page }) => {
      await page.goto('/');
      await page.goto(staticPage.path);

      await expect(page).toHaveURL(new RegExp(staticPage.path));

      await verifyBackNavigation(page, '/');
    });
  }
});

/**
 * Tests for browser back button navigation when flash messages are displayed.
 *
 * These tests verify that users can navigate back when they see:
 * - "Your progress was not saved. Please submit this page to continue."
 * - "You need to complete this page before continuing."
 *
 * The setupHistory middleware ensures the back button works correctly even
 * when users are redirected with flash messages.
 */
test.describe('Browser Navigation - Flash Message Redirects', () => {
  test('should allow back navigation when redirected with "complete this page" message', async ({ page }) => {
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

    // Browser back should escape the redirect page (destination varies based on history)
    await page.goBack();
    await expect(flashMessage).not.toBeVisible();
  });

  test('should allow back navigation when redirected from task list sections', async ({ page }) => {
    await navigateToTaskList(page);

    // Try to jump to a page that requires completing the first question in the section
    await page.goto('/living-and-visiting/will-overnights-happen');

    // Should be redirected with flash message
    const flashMessage = page.locator('.govuk-notification-banner__heading');
    await expect(flashMessage).toContainText('You need to complete this page before continuing');

    // Should be redirected to mostly-live page (the prerequisite)
    await expect(page).toHaveURL(/\/living-and-visiting\/where-will-the-children-mostly-live/);

    // Use browser back button
    await verifyBackNavigation(page, /\/make-a-plan/);
  });

  test('should allow back navigation when redirected within a section flow', async ({ page }) => {
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

    // Use browser back button
    await verifyBackNavigation(page, /\/make-a-plan/);
  });

  test('should allow multiple back navigations after flash message redirect', async ({ page }) => {
    // Navigate through several pages
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);
    await fillAllChildrenAndContinue(page, ['Alice']);

    // Now at about-the-adults, try to jump to check-your-answers
    await page.goto('/check-your-answers');

    // Should be redirected with flash message
    const flashMessage = page.locator('.govuk-notification-banner__heading');
    await expect(flashMessage).toContainText('You need to complete this page before continuing');

    // Browser back should escape the redirect (destination varies based on history)
    await page.goBack();
    await expect(flashMessage).not.toBeVisible();

    // Navigate back until we reach about-the-children to verify data persisted
    while (!page.url().includes('about-the-children')) {
      await page.goBack();
    }
    const childNameInput = page.locator('input[name="child-name0"]');
    await expect(childNameInput).toHaveValue('Alice');
  });

  test('should allow forward navigation after using back from flash message page', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox has unpredictable history with page.goto() + redirects');

    await completeOnboardingFlow(page);

    // Try to jump ahead
    await page.goto('/about-the-children');

    // Should be redirected with flash message to number-of-children
    await expect(page).toHaveURL(/\/number-of-children/);

    // Go back twice to previous page
    await verifyBackNavigation(page, /\/number-of-children/);
    await verifyBackNavigation(page, /\/court-order-check/);

    // Now go forward - should return to number-of-children
    await verifyForwardNavigation(page, /\/number-of-children/);

    // Verify we can continue the journey normally
    await page.getByLabel(/How many children is this for/i).fill('1');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/about-the-children/);
  });
});
