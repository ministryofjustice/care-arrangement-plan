import { test, expect } from '@playwright/test';

import { navigateToTaskList, expectErrorSummaryVisible } from './fixtures/test-helpers';

const OPTION_FIELD_ID = 'child-health-option';
const ARRANGEMENT_FIELD_ID = 'child-health-describe-arrangement';
const NEEDS_FIELD_ID = 'child-health-needs-description';
const ARRANGEMENT = 'A grandparent will decide routine appointments';
const HEALTH_NEEDS = 'Asthma inhaler every morning and a yearly review';

test.describe('Child health', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
  });

  test('keeps health needs locked until routine decisions are answered', async ({ page }) => {
    const routineRow = page.locator('li').filter({ hasText: /routine decisions about/i });
    const needsRow = page.locator('li').filter({ hasText: /health needs/i });

    await expect(routineRow).toContainText(/incomplete/i);
    await expect(needsRow).toContainText(/cannot start yet/i);
    await expect(page.getByRole('link', { name: /health needs/i })).toHaveCount(0);
  });

  test('shows an error when no routine decision is selected', async ({ page }) => {
    await page.getByRole('link', { name: /routine decisions about/i }).click();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/child-health$/);
    await expectErrorSummaryVisible(page);
    await expect(page.locator(`#${OPTION_FIELD_ID}-error`)).toContainText(
      'Select how routine decisions about health will be made',
    );
    await expect(page.locator('.govuk-notification-banner')).toHaveCount(0);
  });

  test('shows an error when another arrangement has no description', async ({ page }) => {
    await page.getByRole('link', { name: /routine decisions about/i }).click();
    await page.getByLabel(/another arrangement/i).check();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/child-health$/);
    await expectErrorSummaryVisible(page);
    await expect(page.locator(`#${ARRANGEMENT_FIELD_ID}-error`)).toContainText(
      'Describe the arrangement you are proposing',
    );
  });

  test('continues to health needs after a routine decision is saved', async ({ page }) => {
    await page.getByRole('link', { name: /routine decisions about/i }).click();
    await page.getByLabel(/both parents will decide/i).check();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/child-health-needs/);
    await expect(page.locator('h1')).toContainText(/health needs/i);
    await expect(page.locator('.govuk-notification-banner')).toHaveCount(0);
  });

  test('continues to health needs when the routine decision is skipped', async ({ page }) => {
    await page.getByRole('link', { name: /routine decisions about/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();

    await expect(page).toHaveURL(/\/child-health-needs/);
    await expect(page.locator('h1')).toContainText(/health needs/i);
    await expect(page.locator('.govuk-notification-banner')).toHaveCount(0);
  });

  test('sends someone who opens health needs early back to routine decisions', async ({ page }) => {
    await page.goto('/child-health-needs');

    await expect(page).toHaveURL(/\/child-health$/);
    await expect(page.locator('.govuk-notification-banner__heading')).toContainText(
      'You need to complete this page before continuing',
    );
  });

  test('keeps a saved routine decision when returning to the page', async ({ page }) => {
    await page.getByRole('link', { name: /routine decisions about/i }).click();
    await page.getByLabel(/another arrangement/i).check();
    await page.locator(`#${ARRANGEMENT_FIELD_ID}`).fill(ARRANGEMENT);
    await page.getByRole('button', { name: /save and continue/i }).click();
    await expect(page).toHaveURL(/\/child-health-needs/);

    await page.goto('/child-health');

    await expect(page.getByLabel(/another arrangement/i)).toBeChecked();
    await expect(page.locator(`#${ARRANGEMENT_FIELD_ID}`)).toHaveValue(ARRANGEMENT);
  });

  test('shows an error when health needs are empty or only whitespace', async ({ page }) => {
    await page.getByRole('link', { name: /routine decisions about/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();
    await expect(page).toHaveURL(/\/child-health-needs/);

    await page.getByRole('button', { name: /save and continue/i }).click();
    await expectErrorSummaryVisible(page);
    await expect(page.locator(`#${NEEDS_FIELD_ID}-error`)).toContainText('Describe the health needs');

    await page.locator(`#${NEEDS_FIELD_ID}`).fill('   ');
    await page.getByRole('button', { name: /save and continue/i }).click();
    await expect(page).toHaveURL(/\/child-health-needs/);
    await expect(page.locator(`#${NEEDS_FIELD_ID}-error`)).toContainText('Describe the health needs');
  });

  test('marks both health tasks complete after health needs are saved', async ({ page }) => {
    await page.getByRole('link', { name: /routine decisions about/i }).click();
    await page.getByLabel(/you will decide/i).check();
    await page.getByRole('button', { name: /save and continue/i }).click();
    await page.locator(`#${NEEDS_FIELD_ID}`).fill(HEALTH_NEEDS);
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/make-a-plan/);
    await expect(page.locator('li').filter({ hasText: /routine decisions about/i })).toContainText(/completed/i);
    await expect(page.locator('li').filter({ hasText: /health needs/i })).toContainText(/completed/i);

    await page.getByRole('link', { name: /health needs/i }).click();
    await expect(page.locator(`#${NEEDS_FIELD_ID}`)).toHaveValue(HEALTH_NEEDS);
  });

  test('marks health needs complete when that question is skipped', async ({ page }) => {
    await page.getByRole('link', { name: /routine decisions about/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();

    await expect(page).toHaveURL(/\/make-a-plan/);
    await expect(page.locator('li').filter({ hasText: /routine decisions about/i })).toContainText(/completed/i);
    await expect(page.locator('li').filter({ hasText: /health needs/i })).toContainText(/completed/i);
  });
});
