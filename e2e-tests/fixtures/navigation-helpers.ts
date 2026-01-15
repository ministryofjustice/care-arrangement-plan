import { expect, Page } from '@playwright/test';

/**
 * Verifies back navigation using browser back button and optionally checks data persistence
 */
export async function verifyBackNavigation(
  page: Page,
  expectedUrl: string | RegExp,
  verifyData?: () => Promise<void>
) {
  await page.goBack();
  await expect(page).toHaveURL(expectedUrl);

  if (verifyData) {
    await verifyData();
  }

  // Verify page loaded without errors
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
}

/**
 * Verifies back navigation using the service's GOV.UK Back link and optionally checks data persistence
 */
export async function verifyServiceBackLink(
  page: Page,
  expectedUrl: string | RegExp,
  verifyData?: () => Promise<void>
) {
  await page.locator('.govuk-back-link').click();
  await expect(page).toHaveURL(expectedUrl);

  if (verifyData) {
    await verifyData();
  }

  // Verify page loaded without errors
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
}

/**
 * Verifies forward navigation and optionally checks data persistence
 */
export async function verifyForwardNavigation(
  page: Page,
  expectedUrl: string | RegExp,
  verifyData?: () => Promise<void>
) {
  await page.goForward();
  await expect(page).toHaveURL(expectedUrl);

  if (verifyData) {
    await verifyData();
  }
}
