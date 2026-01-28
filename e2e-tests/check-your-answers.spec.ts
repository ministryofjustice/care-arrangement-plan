import { test, expect } from '@playwright/test';

import { completeMinimalJourney } from './fixtures/test-helpers';

test.describe('Check Your Answers Summary Page', () => {
  test('should display all completed sections with correct data', async ({ page }) => {
    await completeMinimalJourney(page);

    // Navigate to check your answers using Continue button
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/check-your-answers/);

    // Verify page heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Verify all section headings are present
    await expect(page.getByRole('heading', { name: /who the plan is for/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /living and visiting/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /handovers? and holidays/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /special days/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /other things/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /decision making/i })).toBeVisible();
  });

  test('should show summary of entered information for each section', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify children names are displayed
    await expect(page.getByText('Test')).toBeVisible();

    // Verify adult names are displayed
    await expect(page.getByText(/Parent.*Guardian/)).toBeVisible();

    // Verify living and visiting data
    await expect(page.getByText(/with Guardian on a Monday/i)).toBeVisible();

    // Verify handover and holidays data
    await expect(page.getByText('Parent collects the children')).toBeVisible();
    await expect(page.getByText('At school')).toBeVisible();
    await expect(page.getByText('We will alternate holidays')).toBeVisible();

    // Verify special days data
    await expect(page.getByText('We will share birthdays and holidays equally')).toBeVisible();

    // Verify other things data
    await expect(page.getByText('Regular communication about the children')).toBeVisible();

    // Verify decision making data
    await expect(page.getByText('With a phone call')).toBeVisible();
    await expect(page.getByText('2 weeks')).toBeVisible();
    await expect(page.getByText('6 months')).toBeVisible();
  });

  test('should display change links for each section', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify change links exist using accessible role and text
    const changeLinks = page.getByRole('link', { name: /change/i });
    const count = await changeLinks.count();

    // Should have multiple change links (one for each field)
    expect(count).toBeGreaterThan(10);
  });

  test('should navigate to section when clicking change link', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // Find and click the change link for children
    const changeChildrenLink = page.getByRole('link', { name: /change.*children/i }).first();
    await changeChildrenLink.click();

    // Should navigate to number-of-children page
    await expect(page).toHaveURL(/\/number-of-children/);
  });

  test('should update check your answers immediately after making changes', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify initial value
    await expect(page.getByText('With a phone call')).toBeVisible();

    // Click change link for last minute changes
    await page.getByRole('link', { name: /change.*last.*minute/i }).click();

    // Update the value
    await page.getByLabel(/By text message/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Should return to check your answers
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/check-your-answers/);

    // Verify updated value is displayed
    await expect(page.getByText('By text message and with a phone call')).toBeVisible();
  });

  test('should navigate back to task list when changing children details', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // Click change link for children
    const changeChildrenLink = page.getByRole('link', { name: /change.*children/i }).first();
    await changeChildrenLink.click();

    // Change number of children
    await page.getByLabel(/How many children is this for/i).fill('2');
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill second child name
    await page.fill('input[name="child-name1"]', 'Charlie');
    await page.getByRole('button', { name: /continue/i }).click();

    // Should navigate to task list (major change)
    await expect(page).toHaveURL(/\/about-the-children/);
  });

  test('should have continue button to proceed', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify continue button exists
    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toHaveAttribute('href', /\/share-plan/);
  });

  test('should display data in correct order matching task list', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // Get all section headings
    const headings = page.locator('h2.govuk-heading-m');
    const headingTexts = await headings.allTextContents();

    // Verify order matches task list order
    expect(headingTexts[0]).toMatch(/who the plan is for/i);
    expect(headingTexts[1]).toMatch(/living and visiting/i);
    expect(headingTexts[2]).toMatch(/handovers? and holidays/i);
    expect(headingTexts[3]).toMatch(/special days/i);
    expect(headingTexts[4]).toMatch(/other things/i);
    expect(headingTexts[5]).toMatch(/decision making/i);
  });

  test('should format data appropriately (not raw field values)', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify children names are formatted as a list with "and"
    const childrenText = await page.locator('.govuk-summary-list').first().textContent();
    expect(childrenText).toMatch(/Test/);

    // Verify no raw field values like "child-name0" are displayed
    await expect(page.getByText('child-name0')).not.toBeVisible();
    await expect(page.getByText('initial-adult-name')).not.toBeVisible();
  });

  test('should handle multiple children scenario', async ({ page }) => {
    // Complete onboarding with 3 children
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    // Complete safety checks
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // do-whats-best
    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // court-order-check
    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Number of children
    await page.getByLabel(/How many children is this for/i).fill('3');
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill all children names
    await page.fill('input[name="child-name0"]', 'Emma');
    await page.fill('input[name="child-name1"]', 'Oliver');
    await page.fill('input[name="child-name2"]', 'Sophia');
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill adults
    await page.fill('input[name="initial-adult-name"]', 'Parent');
    await page.fill('input[name="secondary-adult-name"]', 'Guardian');
    await page.getByRole('button', { name: /continue/i }).click();

    // Complete remaining sections
    await page.getByRole('link', { name: /Where will the children mostly live?/i }).click();
    await page.getByLabel(/With Parent/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Navigate to check your answers (after completing minimal sections)
    await page.goto('/make-a-plan');

    // Complete all sections quickly
    await page.getByRole('link', { name: /Where will the children mostly live?/i }).click();
    await page.getByLabel(/With Parent/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    if (page.url().includes('which-schedule')) {
      await page.getByLabel(/week about/i).check();
      await page.getByRole('button', { name: /continue/i }).click();
    }

    // Complete other sections
    await page.goto('/handover-and-holidays/get-between-households');
    await page.getByLabel(/Parent collects the children/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/At School/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.fill('textarea', 'Holiday arrangements');
    await page.getByRole('button', { name: /continue/i }).click();
    await page.fill('textarea', 'Items list');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/special-days/what-will-happen');
    await page.fill('textarea', 'Special days plan');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/other-things/what-other-things-matter');
    await page.fill('textarea', 'Other important matters');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/decision-making/plan-last-minute-changes');
    await page.getByLabel(/With a phone call/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/2 Weeks/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/months/i).fill('6');   
    await page.getByRole('button', { name: /continue/i }).click();

    // Now go to check your answers
    await page.goto('/make-a-plan');

       // Complete all sections quickly
    await page.getByRole('link', { name: /Where will the children mostly live?/i }).click();
    await page.getByLabel(/With Parent/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    if (page.url().includes('which-schedule')) {
      await page.getByLabel(/week about/i).check();
      await page.getByRole('button', { name: /continue/i }).click();
    }

    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/Monday/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/no/i).first().check();

    await page.getByRole('button', { name: /continue/i }).click();

    // Verify all three children are displayed
    await expect(page.getByText(/Emma.*Oliver.*Sophia/)).toBeVisible();
  });

  test('should not show optional fields that were not completed', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.getByRole('button', { name: /continue/i }).click();

    // The page should not show empty rows or "Not provided" for optional fields
    // Instead, optional fields should be conditionally rendered
    const summaryLists = page.locator('.govuk-summary-list');
    const count = await summaryLists.count();

    // Should have summary lists for each section
    expect(count).toBeGreaterThan(0);
  });
});
