import { expect, Page } from '@playwright/test';

export async function startJourney(page: Page) {
  // Start from homepage - with USE_AUTH=false this goes directly to safety-check
  await page.goto('/');
  await page.getByRole('button', { name: /start now/i }).click();
}

export async function completeSafetyChecks(page: Page) {
  await page.getByLabel(/yes/i).first().check();
  await page.getByRole('button', { name: /continue/i }).click();

  await page.getByLabel(/yes/i).first().check();
  await page.getByRole('button', { name: /continue/i }).click();
}

export async function completeOnboardingFlow(page: Page) {
  await startJourney(page);
  await completeSafetyChecks(page);

  // do-whats-best page - check the required checkbox (note: uses fancy apostrophe)
  await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
  await page.getByRole('button', { name: /continue/i }).click();

  // court-order-check
  await page.getByLabel(/no/i).first().check();
  await page.getByRole('button', { name: /continue/i }).click();
}

export async function fillNumberOfChildren(page: Page, count: number) {
  // The number-of-children page uses a text input, not radio buttons
  await page.getByLabel(/How many children is this for/i).fill(count.toString());
  await page.getByRole('button', { name: /continue/i }).click();
}

export async function fillChildDetails(page: Page, firstName: string, childIndex: number = 0) {
  // The about-the-children page only collects first names
  // Field name is 'child-name0', 'child-name1', etc.
  const fieldName = `child-name${childIndex}`;
  await page.fill(`input[name="${fieldName}"]`, firstName);
}

export async function fillAllChildrenAndContinue(page: Page, childNames: string[]) {
  // Fill all children's first names, then click continue once
  for (let i = 0; i < childNames.length; i++) {
    await fillChildDetails(page, childNames[i], i);
  }
  await page.getByRole('button', { name: /continue/i }).click();
}

export async function fillAdultDetails(page: Page, adult1FirstName: string, adult2FirstName: string) {
  // The about-the-adults page only collects first names
  await page.fill('input[name="initial-adult-name"]', adult1FirstName);
  await page.fill('input[name="secondary-adult-name"]', adult2FirstName);
  await page.getByRole('button', { name: /continue/i }).click();
}

export async function navigateToTaskList(page: Page) {
  await completeOnboardingFlow(page);
  await fillNumberOfChildren(page, 1);
  await fillAllChildrenAndContinue(page, ['Test']);
  await fillAdultDetails(page, 'Parent', 'Guardian');
}

export async function acceptCookies(page: Page) {
  const cookieBanner = page.locator('.govuk-cookie-banner');
  const count = await cookieBanner.count();
  if (count > 0 && (await cookieBanner.isVisible())) {
    const acceptButton = cookieBanner.getByRole('button', { name: /accept/i });
    if ((await acceptButton.count()) > 0) {
      await acceptButton.click();
    }
  }
}

export function generateTestChildData(index: number) {
  const firstNames = ['Emma', 'Oliver', 'Sophia', 'James', 'Isabella'];

  return {
    firstName: firstNames[index % firstNames.length],
  };
}

export async function expectErrorSummaryVisible(page: Page, expectedTitle = 'There is a problem') {
  const errorSummary = page.locator('.govuk-error-summary');
  await expect(errorSummary).toBeVisible();
  await expect(page.locator('.govuk-error-summary__title')).toHaveText(expectedTitle);
}

export async function expectFieldError(page: Page, fieldId: string, errorMessage: string) {
  const errorElement = page.locator(`#${fieldId}-error`);
  await expect(errorElement).toBeVisible();
  await expect(errorElement).toContainText(errorMessage);

  const input = page.locator(`#${fieldId}`);
  await expect(input).toHaveClass(/govuk-input--error/);
}

export async function expectErrorSummaryLinkToField(page: Page, fieldId: string) {
  const errorLink = page.locator(`.govuk-error-summary__list a[href="#${fieldId}"]`);
  await expect(errorLink).toBeVisible();
}
  /**
 * Complete the Living and Visiting section with minimal required data
 */
export async function completeLivingAndVisitingSection(page: Page) {
  // Ensure we're on the task list
  await page.goto('/make-a-plan');

  // Click the first task in Living and Visiting section
  await page.getByRole('link', { name: /where will the children mostly live/i }).click();

  // Where will the children mostly live - select first option (With Parent)
  await page.getByLabel(/with parent/i).check();
  await page.getByRole('button', { name: /continue/i }).click();

  // Check if we're on which-schedule page or back at task list
  await page.waitForLoadState('networkidle');
  const urlAfterMostlyLive = page.url();
  if (urlAfterMostlyLive.includes('which-schedule')) {
    await page.getByLabel(/week about/i).check();
    await page.getByRole('button', { name: /continue/i }).click();
  }

  // Check if we're on will-overnights-happen page or back at task list
  await page.waitForLoadState('networkidle');
  if (page.url().includes('will-overnights-happen')) {
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Which days overnight
    await page.getByLabel(/monday/i).check();
    await page.getByRole('button', { name: /continue/i }).click();
  }

  // Check if we're on will-daytime-visits-happen page or back at task list
  await page.waitForLoadState('networkidle');
  if (page.url().includes('will-daytime-visits-happen')) {
    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();
  }

  // Wait for return to task list
  await page.waitForURL(/\/make-a-plan/);
}

/**
 * Complete the Handover and Holidays section with minimal required data
 */
export async function completeHandoverAndHolidaysSection(page: Page) {
  // Get between households
  await page.getByRole('link', { name: /how will the children get between households/i }).click();
  await page.getByLabel(/parent collects/i).check();
  await page.getByRole('button', { name: /continue/i }).click();

  // Where handover - checkboxes (flows directly from previous page)
  await page.getByLabel(/at school/i).check();
  await page.getByRole('button', { name: /continue/i }).click();

  // Will change during school holidays (flows directly from previous page)
  await page.getByLabel(/yes/i).first().check();
  await page.getByRole('button', { name: /continue/i }).click();

  // How change during school holidays (flows directly from previous page)
  await page.fill('textarea', 'We will alternate holidays');
  await page.getByRole('button', { name: /continue/i }).click();

  // Items for changeover (flows directly from previous page)
  await page.fill('textarea', 'School bag, clothes, favorite toys');
  await page.getByRole('button', { name: /continue/i }).click();

  // Wait for return to task list
  await page.waitForURL(/\/make-a-plan/);
}

/**
 * Complete the Special Days section with minimal required data
 */
export async function completeSpecialDaysSection(page: Page) {
  // What will happen
  await page.getByRole('link', { name: /what will happen on special days/i }).click();
  await page.fill('textarea', 'We will share birthdays and holidays equally');
  await page.getByRole('button', { name: /continue/i }).click();

  // Wait for return to task list
  await page.waitForURL(/\/make-a-plan/);
}

/**
 * Complete the Other Things section with minimal required data
 */
export async function completeOtherThingsSection(page: Page) {
  // What other things matter
  await page.getByRole('link', { name: /what other things matter to your children/i }).click();
  await page.fill('textarea', 'Regular communication about the children');
  await page.getByRole('button', { name: /continue/i }).click();

  // Wait for return to task list
  await page.waitForURL(/\/make-a-plan/);
}

/**
 * Complete the Decision Making section with minimal required data
 */
export async function completeDecisionMakingSection(page: Page) {
  // Plan last minute changes - checkboxes
  await page.getByRole('link', { name: /how should last-minute changes be communicated/i }).click();
  await page.getByLabel(/with a phone call/i).check();
  await page.getByRole('button', { name: /continue/i }).click();

  // Plan long term notice - radio buttons (flows directly from previous page)
  await page.getByLabel(/2 weeks/i).check();
  await page.getByRole('button', { name: /continue/i }).click();

  // Plan review - text inputs for months/years (flows directly from previous page)
  await page.getByLabel(/months/i).fill('6');
  await page.getByRole('button', { name: /continue/i }).click();

  // Wait for return to task list
  await page.waitForURL(/\/make-a-plan/);
}

/**
 * Complete a minimal journey through all sections
 * This completes the minimum required to reach check your answers
 */
export async function completeMinimalJourney(page: Page) {
  // Complete onboarding to reach task list
  await navigateToTaskList(page);

  // Complete all required sections
  await completeLivingAndVisitingSection(page);
  await completeHandoverAndHolidaysSection(page);
  await completeSpecialDaysSection(page);
  await completeOtherThingsSection(page);
  await completeDecisionMakingSection(page);

  // Return to task list
  await page.goto('/make-a-plan');
}
