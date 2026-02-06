import { test, expect } from '@playwright/test';

import {
  navigateToTaskList,
  expectErrorSummaryVisible,
  completeLivingAndVisitingSection,
  completeHandoverAndHolidaysSection,
  completeSpecialDaysSection,
  completeDecisionMakingSection,
} from './fixtures/test-helpers';

const FIELD_ID = 'what-other-things-matter-0';
const ERROR_MESSAGE = 'Describe what other things matter to your children';
const SAMPLE_TEXT =
  'Regular video calls when not together. Consistent bedtimes across both homes. Access to grandparents on both sides.';

test.describe('Other Things Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
  });

  test.describe('Navigation', () => {
    test('should navigate to other things from task list', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();

      await expect(page).toHaveURL(/\/other-things\/what-other-things-matter/);
      await expect(page.locator('h1')).toContainText('What other things matter to your children?');
    });
  });

  test.describe('Empty Submission Validation', () => {
    test('should show error when submitting empty textarea', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGE);
    });

    test('should show error when submitting whitespace only', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.locator(`#${FIELD_ID}`).fill('   ');
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);
      await expect(page.locator(`#${FIELD_ID}-error`)).toContainText(ERROR_MESSAGE);
    });
  });

  test.describe('Valid Input', () => {
    test('should accept free-text description and return to task list', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(SAMPLE_TEXT);
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
    });

    test('should accept short input', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.locator(`#${FIELD_ID}`).fill('Video calls weekly.');
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
    });

    test('should accept long detailed input', async ({ page }) => {
      const longText = `
        Communication: Weekly video calls when children are with the other parent.
        Education: Both parents attend school events and parent-teacher meetings.
        Health: Share medical information and attend important appointments together.
        Activities: Continue swimming lessons on Saturdays, piano on Wednesdays.
        Family: Regular contact with grandparents, aunts, uncles on both sides.
        Pets: The family dog stays at the main residence but children can visit.
        Religion: Children attend Sunday school as agreed.
        Diet: Consistent meal routines and no sugary snacks before bed.
      `.trim();

      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(longText);
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
    });
  });

  test.describe('Do Not Need To Decide Option', () => {
    test('should allow skipping with "do not need to decide" option', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.getByRole('button', { name: /do not need to decide/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist entered text when navigating away and back', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(SAMPLE_TEXT);
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);

      // Navigate back to other things
      await page.getByRole('link', { name: /what other things matter/i }).click();

      await expect(page.locator(`#${FIELD_ID}`)).toHaveValue(SAMPLE_TEXT);
    });
  });

  test.describe('Task List Status', () => {
    test('should show incomplete status before completing other things', async ({ page }) => {
      const otherThingsRow = page.locator('li').filter({ hasText: /what other things matter/i });
      await expect(otherThingsRow).toContainText(/incomplete/i);
    });

    test('should show completed status after submitting other things', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(SAMPLE_TEXT);
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);

      const otherThingsRow = page.locator('li').filter({ hasText: /what other things matter/i });
      await expect(otherThingsRow).toContainText(/completed/i);
    });

    test('should show completed status after selecting "do not need to decide"', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.getByRole('button', { name: /do not need to decide/i }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);

      const otherThingsRow = page.locator('li').filter({ hasText: /what other things matter/i });
      await expect(otherThingsRow).toContainText(/completed/i);
    });
  });

  test.describe('Check Your Answers', () => {
    test('should display entered text in check your answers', async ({ page }) => {
      // Complete all required sections
      await completeLivingAndVisitingSection(page);
      await completeHandoverAndHolidaysSection(page);
      await completeSpecialDaysSection(page);

      // Complete other things with our sample text
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.locator(`#${FIELD_ID}`).fill(SAMPLE_TEXT);
      await page.getByRole('button', { name: /continue/i }).click();

      // Complete decision making
      await completeDecisionMakingSection(page);

      // Click continue to check your answers
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page).toHaveURL(/\/check-your-answers/);
      await expect(page.locator('body')).toContainText(SAMPLE_TEXT);
    });
  });

  test.describe('Error Display', () => {
    test('should display error summary with link to field', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();

      await expectErrorSummaryVisible(page);

      const errorLink = page.locator(`.govuk-error-summary__list a[href="#${FIELD_ID}-error"]`);
      await expect(errorLink).toBeVisible();
    });

    test('should apply error styling to textarea', async ({ page }) => {
      await page.getByRole('link', { name: /what other things matter/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();

      await expect(page.locator(`#${FIELD_ID}`)).toHaveClass(/govuk-textarea--error/);
    });
  });
});
