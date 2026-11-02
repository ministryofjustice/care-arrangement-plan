import { test, expect } from '@playwright/test';

import { navigateToTaskList, expectErrorSummaryVisible } from './fixtures/test-helpers';

const SHARE_OPTION_FIELD_ID = 'education-share-information-option';
const SHARE_ARRANGEMENT_FIELD_ID = 'education-share-information-describe-arrangement';
const ROUTINE_OPTION_FIELD_ID = 'education-routine-decisions-option';
const ROUTINE_ARRANGEMENT_FIELD_ID = 'education-routine-decisions-describe-arrangement';
const MEETINGS_OPTION_FIELD_ID = 'education-school-meetings-option';
const MEETINGS_ARRANGEMENT_FIELD_ID = 'education-school-meetings-describe-arrangement';
const ARRANGEMENT = 'The school emails a grandparent';

test.describe('Education', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
  });

  test('keeps later education tasks locked until school information sharing is answered', async ({ page }) => {
    const shareRow = page.locator('li').filter({ hasText: /information from .* school be shared/i });
    const routineRow = page.locator('li').filter({ hasText: /routine decisions about .* education/i });
    const meetingsRow = page.locator('li').filter({ hasText: /school meetings and activities/i });

    await expect(shareRow).toContainText(/incomplete/i);
    await expect(routineRow).toContainText(/cannot start yet/i);
    await expect(meetingsRow).toContainText(/cannot start yet/i);
    await expect(page.getByRole('link', { name: /routine decisions about .* education/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /school meetings and activities/i })).toHaveCount(0);
  });

  test('shows an error when no way of sharing school information is selected', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/education\/share-information/);
    await expectErrorSummaryVisible(page);
    await expect(page.locator(`#${SHARE_OPTION_FIELD_ID}-error`)).toContainText(
      'Select how information from the school should be shared',
    );
    await expect(page.locator('.govuk-notification-banner')).toHaveCount(0);
  });

  test('shows an error when another arrangement for sharing information has no description', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByLabel(/another arrangement/i).check();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/education\/share-information/);
    await expectErrorSummaryVisible(page);
    await expect(page.locator(`#${SHARE_ARRANGEMENT_FIELD_ID}-error`)).toContainText(
      'Describe the arrangement you are proposing',
    );

    await page.locator(`#${SHARE_ARRANGEMENT_FIELD_ID}`).fill('   ');
    await page.getByRole('button', { name: /save and continue/i }).click();
    await expect(page).toHaveURL(/\/education\/share-information/);
    await expect(page.locator(`#${SHARE_ARRANGEMENT_FIELD_ID}-error`)).toContainText(
      'Describe the arrangement you are proposing',
    );
  });

  test('continues to routine decisions after school information sharing is saved', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByLabel(/both parents will receive information/i).check();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/education\/routine-decisions/);
    await expect(page.locator('h1')).toContainText(/routine decisions about .* education/i);
    await expect(page.locator('.govuk-notification-banner')).toHaveCount(0);
  });

  test('continues to routine decisions when school information sharing is skipped', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();

    await expect(page).toHaveURL(/\/education\/routine-decisions/);
    await expect(page.locator('h1')).toContainText(/routine decisions about .* education/i);
    await expect(page.locator('.govuk-notification-banner')).toHaveCount(0);
  });

  test('sends someone who opens a later education page early back to school information sharing', async ({ page }) => {
    await page.goto('/education/routine-decisions');

    await expect(page).toHaveURL(/\/education\/share-information/);
    await expect(page.locator('.govuk-notification-banner__heading')).toContainText(
      'You need to complete this page before continuing',
    );

    await page.goto('/education/school-meetings');

    await expect(page).toHaveURL(/\/education\/share-information/);
    await expect(page.locator('.govuk-notification-banner__heading')).toContainText(
      'You need to complete this page before continuing',
    );
  });

  test('keeps a saved sharing arrangement when returning to the page', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByLabel(/another arrangement/i).check();
    await page.locator(`#${SHARE_ARRANGEMENT_FIELD_ID}`).fill(ARRANGEMENT);
    await page.getByRole('button', { name: /save and continue/i }).click();
    await expect(page).toHaveURL(/\/education\/routine-decisions/);

    await page.goto('/education/share-information');

    await expect(page.getByLabel(/another arrangement/i)).toBeChecked();
    await expect(page.locator(`#${SHARE_ARRANGEMENT_FIELD_ID}`)).toHaveValue(ARRANGEMENT);
  });

  test('shows an error when no routine education decision is selected', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();
    await expect(page).toHaveURL(/\/education\/routine-decisions/);

    await page.getByRole('button', { name: /save and continue/i }).click();
    await expectErrorSummaryVisible(page);
    await expect(page.locator(`#${ROUTINE_OPTION_FIELD_ID}-error`)).toContainText(
      'Select how routine decisions about education will be made',
    );

    await page.getByLabel(/another arrangement/i).check();
    await page.locator(`#${ROUTINE_ARRANGEMENT_FIELD_ID}`).fill('   ');
    await page.getByRole('button', { name: /save and continue/i }).click();
    await expect(page).toHaveURL(/\/education\/routine-decisions/);
    await expect(page.locator(`#${ROUTINE_ARRANGEMENT_FIELD_ID}-error`)).toContainText(
      'Describe the arrangement you are proposing',
    );
  });

  test('shows an error when no one is selected to attend school meetings', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();
    await expect(page).toHaveURL(/\/education\/school-meetings/);

    await page.getByRole('button', { name: /save and continue/i }).click();
    await expectErrorSummaryVisible(page);
    await expect(page.locator(`#${MEETINGS_OPTION_FIELD_ID}-error`)).toContainText(
      'Select who will attend school meetings and activities',
    );

    await page.getByLabel(/another arrangement/i).check();
    await page.locator(`#${MEETINGS_ARRANGEMENT_FIELD_ID}`).fill('   ');
    await page.getByRole('button', { name: /save and continue/i }).click();
    await expect(page).toHaveURL(/\/education\/school-meetings/);
    await expect(page.locator(`#${MEETINGS_ARRANGEMENT_FIELD_ID}-error`)).toContainText(
      'Describe the arrangement you are proposing',
    );
  });

  test('marks every education task complete after the answers are saved', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByLabel(/you will receive information/i).check();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await page.getByLabel(/you will decide/i).check();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await page.getByLabel(/the parent caring for Test at the time will attend/i).check();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/make-a-plan/);
    await expect(page.locator('li').filter({ hasText: /information from .* school be shared/i })).toContainText(
      /completed/i,
    );
    await expect(page.locator('li').filter({ hasText: /routine decisions about .* education/i })).toContainText(
      /completed/i,
    );
    await expect(page.locator('li').filter({ hasText: /school meetings and activities/i })).toContainText(/completed/i);

    await page.getByRole('link', { name: /school meetings and activities/i }).click();
    await expect(page.getByLabel(/the parent caring for Test at the time will attend/i)).toBeChecked();
  });

  test('marks every education task complete when each question is skipped', async ({ page }) => {
    await page.getByRole('link', { name: /information from .* school be shared/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();
    await page.getByRole('button', { name: /skip this question/i }).click();

    await expect(page).toHaveURL(/\/make-a-plan/);
    await expect(page.locator('li').filter({ hasText: /information from .* school be shared/i })).toContainText(
      /completed/i,
    );
    await expect(page.locator('li').filter({ hasText: /routine decisions about .* education/i })).toContainText(
      /completed/i,
    );
    await expect(page.locator('li').filter({ hasText: /school meetings and activities/i })).toContainText(/completed/i);
  });
});
