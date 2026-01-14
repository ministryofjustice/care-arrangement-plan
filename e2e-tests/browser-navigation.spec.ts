import { test, expect } from '@playwright/test';

import {
  startJourney,
  completeSafetyChecks,
  completeOnboardingFlow,
  fillNumberOfChildren,
  fillAllChildrenAndContinue,
  navigateToTaskList,
} from './fixtures/test-helpers';
import { verifyBackNavigation, verifyForwardNavigation } from './fixtures/navigation-helpers';

test.describe('Browser Navigation - Onboarding Flow', () => {
  test('should navigate back from children-safety-check to safety-check', async ({ page }) => {
    await startJourney(page);

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    await verifyBackNavigation(
      page,
      /\/safety-check/,
      async () => {
        const yesRadio = page.getByLabel(/yes/i).first();
        await expect(yesRadio).toBeChecked();
      }
    );

    // Verify we can proceed forward
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/children-safety-check/);
  });

  test('should navigate back from do-whats-best to children-safety-check', async ({ page }) => {
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

    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/do-whats-best/);
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
    await page.goBack();

    await expect(page).toHaveURL('/');

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

    // Navigate back and forward multiple times
    await page.goBack();
    await expect(page).toHaveURL(/\/number-of-children/);

    await page.goForward();
    await expect(page).toHaveURL(/\/about-the-children/);

    await page.goBack();
    await page.goBack();
    await expect(page).toHaveURL(/\/court-order-check/);

    await page.goForward();
    await page.goForward();
    await expect(page).toHaveURL(/\/about-the-children/);

    // Verify data persisted
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
      await page.goBack();
      await expect(page).toHaveURL(step.url);
      await step.checks();
    }
  });

  test('should handle validation error page navigation', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    // Submit without filling to trigger error
    await page.getByRole('button', { name: /continue/i }).click();

    const errorSummary = page.locator('.govuk-error-summary');
    await expect(errorSummary).toBeVisible();

    await verifyBackNavigation(
      page,
      /\/number-of-children/,
      async () => {
        const numberInput = page.getByLabel(/How many children is this for/i);
        await expect(numberInput).toHaveValue('1');
      }
    );

    await page.goForward();
    await expect(page).toHaveURL(/\/about-the-children/);

    // Now fill correctly
    await page.fill('input[name="child-name0"]', 'ValidName');
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/about-the-adults/);
  });

  test('should maintain modified data when navigating back without submitting', async ({ page }) => {
    await completeOnboardingFlow(page);
    await fillNumberOfChildren(page, 1);

    await page.fill('input[name="child-name0"]', 'FirstName');
    await page.fill('input[name="child-name0"]', 'ModifiedName');

    await page.goBack();
    await page.goForward();

    const childNameInput = page.locator('input[name="child-name0"]');
    await expect(childNameInput).toHaveValue('ModifiedName');
  });

  test('should handle rapid back/forward navigation across multiple pages', async ({ page }) => {
    await completeOnboardingFlow(page);

    // Fill number of children without continuing (to stay on that page)
    await page.getByLabel(/How many children is this for/i).fill('3');

    // Navigate back step by step and verify each page
    await page.goBack();
    await expect(page).toHaveURL(/\/court-order-check/);

    await page.goBack();
    await expect(page).toHaveURL(/\/do-whats-best/);

    await page.goBack();
    await expect(page).toHaveURL(/\/children-safety-check/);

    // Navigate forward step by step and verify each page
    await page.goForward();
    await expect(page).toHaveURL(/\/do-whats-best/);

    await page.goForward();
    await expect(page).toHaveURL(/\/court-order-check/);

    await page.goForward();
    await expect(page).toHaveURL(/\/number-of-children/);

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

  // Test data for task list sections
  const taskListSections = [
    {
      name: 'living-and-visiting',
      path: '/living-and-visiting/where-will-the-children-mostly-live',
      inputType: 'radio',
    },
    {
      name: 'handover-and-holidays',
      path: '/handover-and-holidays/get-between-households',
      inputType: 'radio',
    },
    {
      name: 'special-days',
      path: '/special-days/what-will-happen',
      inputType: 'textarea',
      testValue: 'Special days arrangements',
    },
    {
      name: 'other-things',
      path: '/other-things/what-other-things-matter',
      inputType: 'textarea',
      testValue: 'Other important things',
    },
    {
      name: 'decision-making',
      path: '/decision-making/plan-last-minute-changes',
      inputType: 'checkbox',
    },
  ];

  for (const section of taskListSections) {
    test(`should navigate back from ${section.name} section`, async ({ page }) => {
      await page.goto(section.path);

      if (section.inputType === 'radio') {
        const radioButtons = page.getByRole('radio');
        await radioButtons.first().check();
        await page.getByRole('button', { name: /continue/i }).click();

        await page.goBack();
        await expect(page).toHaveURL(new RegExp(section.path));

        const firstRadio = radioButtons.first();
        await expect(firstRadio).toBeChecked();
      } else if (section.inputType === 'checkbox') {
        const checkboxes = page.getByRole('checkbox');
        await checkboxes.first().check();
        await page.getByRole('button', { name: /continue/i }).click();

        await page.goBack();
        await expect(page).toHaveURL(new RegExp(section.path));

        const firstCheckbox = checkboxes.first();
        await expect(firstCheckbox).toBeChecked();
      } else if (section.inputType === 'textarea') {
        const textarea = page.locator('textarea').first();
        await textarea.fill(section.testValue);
        await page.getByRole('button', { name: /continue/i }).click();

        await page.goBack();
        await expect(page).toHaveURL(new RegExp(section.path));
        await expect(textarea).toHaveValue(section.testValue);
      }
    });

    test(`should navigate back to task list from ${section.name}`, async ({ page }) => {
      await page.goto(section.path);

      await page.goBack();
      await expect(page).toHaveURL(/\/make-a-plan/);

      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });
  }

  test('should handle back/forward through complete section flow', async ({ page }) => {
    await page.goto('/living-and-visiting/where-will-the-children-mostly-live');

    const radioButtons = page.getByRole('radio');
    await radioButtons.first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Go back twice to task list
    await page.goBack();
    await page.goBack();
    await expect(page).toHaveURL(/\/make-a-plan/);

    // Go forward and verify data persisted
    await page.goForward();
    await expect(page).toHaveURL(/\/living-and-visiting\/where-will-the-children-mostly-live/);

    const firstRadio = radioButtons.first();
    await expect(firstRadio).toBeChecked();
  });

  test('should navigate back from check-your-answers to task list', async ({ page }) => {
    await page.goto('/check-your-answers');

    await page.goBack();
    await expect(page).toHaveURL(/\/make-a-plan/);
  });
});

test.describe('Browser Navigation - Static Pages', () => {
  const staticPages = [
    { name: 'accessibility statement', path: '/accessibility-statement' },
    { name: 'cookies', path: '/cookies' },
    { name: 'privacy notice', path: '/privacy-notice' },
    { name: 'contact us', path: '/contact-us' },
    { name: 'terms and conditions', path: '/terms-and-conditions' },
  ];

  for (const staticPage of staticPages) {
    test(`should navigate back from ${staticPage.name}`, async ({ page }) => {
      await page.goto('/');
      await page.goto(staticPage.path);

      await expect(page).toHaveURL(new RegExp(staticPage.path));

      await page.goBack();
      await expect(page).toHaveURL('/');
    });
  }
});
