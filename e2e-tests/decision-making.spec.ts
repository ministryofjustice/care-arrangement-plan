import { test, expect } from '@playwright/test';

import {
  navigateToTaskList,
  expectErrorSummaryVisible,
  completeLivingAndVisitingSection,
  completeHandoverAndHolidaysSection,
  completeSpecialDaysSection,
  completeOtherThingsSection,
} from './fixtures/test-helpers';

const LAST_MINUTE_FIELD_ID = 'plan-last-minute-changes';
const LONG_TERM_FIELD_ID = 'plan-long-term-notice';
const MONTHS_FIELD_ID = 'plan-review-months';
const YEARS_FIELD_ID = 'plan-review-years';

const ERROR_MESSAGES = {
  lastMinute: {
    empty: 'Select a method for how you both communicate changes',
    descriptionEmpty: 'Describe how you will communicate changes',
    exclusiveViolation: 'Describe what other arrangement you are proposing',
  },
  longTerm: {
    empty: 'Select at least one option',
    descriptionEmpty: 'Describe what is the other arrangement you are proposing',
  },
  planReview: {
    bothEmpty: 'Enter months or years',
    notNumber: 'Your answer must be a number',
    notInt: 'Your answer must be a whole number. For example, 3.',
  },
};

test.describe('Decision Making Section', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
  });

  test.describe('Last Minute Changes', () => {
    test.describe('Navigation', () => {
      test('should navigate to last minute changes from task list', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-last-minute-changes/);
        await expect(page.locator('h1')).toContainText('How should last-minute changes be communicated?');
      });
    });

    test.describe('Validation', () => {
      test('should show error when no option is selected', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
        await expect(page.locator(`#${LAST_MINUTE_FIELD_ID}-method-error`)).toContainText(ERROR_MESSAGES.lastMinute.empty);
      });

      test('should show error when "another arrangement" is selected without description', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByLabel(/another arrangement/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
      });
    });

    test.describe('Valid Options', () => {
      test('should accept "By text message"', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByLabel(/by text message/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);
      });

      test('should accept "With a phone call"', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByLabel(/with a phone call/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);
      });

      test('should accept "By email"', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByLabel(/by email/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);
      });

      test('should accept "Using a parenting app"', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByLabel(/using a parenting app/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);
      });

      test('should accept multiple options selected', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByLabel(/by text message/i).check();
        await page.getByLabel(/by email/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);
      });

      test('should accept "another arrangement" with description', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByLabel(/another arrangement/i).check();
        await page.locator(`#${LAST_MINUTE_FIELD_ID}-describe-arrangement`).fill('Via a shared family calendar');
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);
      });
    });

    test.describe('Do Not Need To Decide', () => {
      test('should allow skipping with "do not need to decide"', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByRole('button', { name: /do not need to decide/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);
      });
    });

    test.describe('Data Persistence', () => {
      test('should persist selected options when navigating back', async ({ page }) => {
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByLabel(/by text message/i).check();
        await page.getByLabel(/by email/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);

        // Navigate back
        await page.locator('.govuk-back-link').click();

        await expect(page.getByLabel(/by text message/i)).toBeChecked();
        await expect(page.getByLabel(/by email/i)).toBeChecked();
      });
    });
  });

  test.describe('Long Term Notice', () => {
    // Navigate to long term notice by completing last minute changes first
    async function navigateToLongTermNotice(page: import('@playwright/test').Page) {
      await page.getByRole('link', { name: /how should last-minute changes/i }).click();
      await page.getByLabel(/by text message/i).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/decision-making\/plan-long-term-notice/);
    }

    test.describe('Navigation', () => {
      test('should flow from last minute changes to long term notice', async ({ page }) => {
        await navigateToLongTermNotice(page);

        await expect(page.locator('h1')).toContainText('How much notice should you give to change long-term arrangements?');
      });
    });

    test.describe('Validation', () => {
      test('should show error when no option is selected', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
        await expect(page.locator(`#${LONG_TERM_FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.longTerm.empty);
      });

      test('should show error when "another arrangement" is selected without description', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByLabel(/another arrangement/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
      });
    });

    test.describe('Valid Options', () => {
      test('should accept 2 weeks', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByLabel(/2 weeks/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-review/);
      });

      test('should accept 4 weeks', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByLabel(/4 weeks/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-review/);
      });

      test('should accept 6 weeks', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByLabel(/6 weeks/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-review/);
      });

      test('should accept 8 weeks', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByLabel(/8 weeks/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-review/);
      });

      test('should accept "another arrangement" with description', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByLabel(/another arrangement/i).check();
        await page.locator(`#${LONG_TERM_FIELD_ID}-describe-arrangement`).fill('At least 3 months for holiday changes');
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-review/);
      });
    });

    test.describe('Do Not Need To Decide', () => {
      test('should allow skipping with "do not need to decide"', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByRole('button', { name: /do not need to decide/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-review/);
      });
    });

    test.describe('Data Persistence', () => {
      test('should persist selected option when navigating back', async ({ page }) => {
        await navigateToLongTermNotice(page);
        await page.getByLabel(/4 weeks/i).check();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/decision-making\/plan-review/);

        // Navigate back
        await page.locator('.govuk-back-link').click();

        await expect(page.getByLabel(/4 weeks/i)).toBeChecked();
      });
    });
  });

  test.describe('Plan Review', () => {
    // Navigate to plan review by completing previous steps
    async function navigateToPlanReview(page: import('@playwright/test').Page) {
      await page.getByRole('link', { name: /how should last-minute changes/i }).click();
      await page.getByLabel(/by text message/i).check();
      await page.getByRole('button', { name: /continue/i }).click();

      await page.getByLabel(/2 weeks/i).check();
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/decision-making\/plan-review/);
    }

    test.describe('Navigation', () => {
      test('should flow from long term notice to plan review', async ({ page }) => {
        await navigateToPlanReview(page);

        await expect(page.locator('h1')).toContainText("When will the children’s needs change?");
      });
    });

    test.describe('Validation', () => {
      test('should show error when both fields are empty', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
        await expect(page.locator(`#${MONTHS_FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.planReview.bothEmpty);
      });

      test('should accept both months and years (e.g., 0 years and 6 months)', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/months/i).fill('6');
        await page.getByLabel(/years/i).fill('0');
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/make-a-plan/);
      });

      test('should show error for non-numeric months', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/months/i).fill('abc');
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
        await expect(page.locator(`#${MONTHS_FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.planReview.notNumber);
      });

      test('should show error for non-numeric years', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/years/i).fill('abc');
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
        await expect(page.locator(`#${YEARS_FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.planReview.notNumber);
      });

      test('should show error for decimal months', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/months/i).fill('2.5');
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
        await expect(page.locator(`#${MONTHS_FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.planReview.notInt);
      });

      test('should show error for decimal years', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/years/i).fill('1.5');
        await page.getByRole('button', { name: /continue/i }).click();

        await expectErrorSummaryVisible(page);
        await expect(page.locator(`#${YEARS_FIELD_ID}-error`)).toContainText(ERROR_MESSAGES.planReview.notInt);
      });
    });

    test.describe('Valid Input', () => {
      test('should accept months only', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/months/i).fill('6');
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/make-a-plan/);
      });

      test('should accept years only', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/years/i).fill('2');
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/make-a-plan/);
      });

      test('should accept 1 month', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/months/i).fill('1');
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/make-a-plan/);
      });

      test('should accept 1 year', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/years/i).fill('1');
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/make-a-plan/);
      });
    });

    test.describe('Data Persistence', () => {
      test('should persist months value when navigating back', async ({ page }) => {
        await navigateToPlanReview(page);
        await page.getByLabel(/months/i).fill('6');
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page).toHaveURL(/\/make-a-plan/);

        // Navigate back to plan review via task list link
        // Decision making section links to first incomplete item or first item
        await page.getByRole('link', { name: /how should last-minute changes/i }).click();
        await page.getByRole('button', { name: /continue/i }).click();
        await page.getByRole('button', { name: /continue/i }).click();

        await expect(page.getByLabel(/months/i)).toHaveValue('6');
      });
    });
  });

  test.describe('Task List Status', () => {
    test('should show decision making tasks as incomplete initially', async ({ page }) => {
      const lastMinuteRow = page.locator('li').filter({ hasText: /how should last-minute changes/i });
      await expect(lastMinuteRow).toContainText(/incomplete/i);
    });

    test('should show long term notice as "cannot start" before last minute changes is complete', async ({ page }) => {
      const longTermRow = page.locator('li').filter({ hasText: /how much notice/i });
      await expect(longTermRow).toContainText(/cannot start/i);
    });

    test('should show plan review as "cannot start" before long term notice is complete', async ({ page }) => {
      const planReviewRow = page.locator('li').filter({ hasText: /when will the children/i });
      await expect(planReviewRow).toContainText(/cannot start/i);
    });

    test('should update statuses as sections are completed', async ({ page }) => {
      // Complete last minute changes
      await page.getByRole('link', { name: /how should last-minute changes/i }).click();
      await page.getByLabel(/by text message/i).check();
      await page.getByRole('button', { name: /continue/i }).click();

      // Complete long term notice
      await page.getByLabel(/4 weeks/i).check();
      await page.getByRole('button', { name: /continue/i }).click();

      // Complete plan review
      await page.getByLabel(/months/i).fill('6');
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);

      // All three should be completed
      const lastMinuteRow = page.locator('li').filter({ hasText: /how should last-minute changes/i });
      await expect(lastMinuteRow).toContainText(/completed/i);

      const longTermRow = page.locator('li').filter({ hasText: /how much notice/i });
      await expect(longTermRow).toContainText(/completed/i);

      const planReviewRow = page.locator('li').filter({ hasText: /when will the children/i });
      await expect(planReviewRow).toContainText(/completed/i);
    });
  });

  test.describe('Check Your Answers', () => {
    test('should display all decision making answers in check your answers', async ({ page }) => {
      // Complete prerequisite sections
      await completeLivingAndVisitingSection(page);
      await completeHandoverAndHolidaysSection(page);
      await completeSpecialDaysSection(page);
      await completeOtherThingsSection(page);

      // Complete decision making with specific answers
      await page.getByRole('link', { name: /how should last-minute changes/i }).click();
      await page.getByLabel(/by text message/i).check();
      await page.getByLabel(/by email/i).check();
      await page.getByRole('button', { name: /continue/i }).click();

      await page.getByLabel(/4 weeks/i).check();
      await page.getByRole('button', { name: /continue/i }).click();

      await page.getByLabel(/months/i).fill('6');
      await page.getByRole('button', { name: /continue/i }).click();

      // Navigate to check your answers
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/check-your-answers/);

      // Verify answers appear
      await expect(page.locator('body')).toContainText(/text message/i);
      await expect(page.locator('body')).toContainText(/email/i);
      await expect(page.locator('body')).toContainText(/4 weeks/i);
      await expect(page.locator('body')).toContainText(/6 months/i);
    });
  });

  test.describe('Error Display', () => {
    test('should display error summary with link for last minute changes', async ({ page }) => {
      await page.getByRole('link', { name: /how should last-minute changes/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);

      const errorLink = page.locator(`.govuk-error-summary__list a[href="#${LAST_MINUTE_FIELD_ID}-method-error"]`);
      await expect(errorLink).toBeVisible();
    });
  });
});
