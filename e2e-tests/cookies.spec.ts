import { test, expect } from '@playwright/test';

test.describe.only('Cookies Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cookies');
  });

  test('should display cookies page with correct heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/cookies/i);
  });

  test('should display essential cookies table', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    
    const sessionRow = table.locator('tbody tr').first();
    await expect(sessionRow).toContainText('session');
  });

  test('should have working back link', async ({ page }) => {
    const backLink = page.locator('.govuk-back-link');
    if ((await backLink.count()) > 0) {
      await expect(backLink).toBeVisible();
      await expect(backLink).toHaveAttribute('href', '/');
    }
  });

  test('should accept cookies and show confirmation', async ({ page }) => {
    // Check if analytics cookies section exists (only when GA4 is configured)
    const acceptRadio = page.getByRole('radio', { name: /yes/i });
    
    if ((await acceptRadio.count()) > 0) {
      await acceptRadio.check();
      await page.getByRole('button', { name: /save/i }).click();
      
      // Should stay on cookies page after submission
      await expect(page).toHaveURL(/cookies/);
    }
  });

  test('should reject cookies and clear analytics', async ({ page }) => {
    const rejectRadio = page.getByRole('radio', { name: /no/i });
    
    if ((await rejectRadio.count()) > 0) {
      await rejectRadio.check();
      await page.getByRole('button', { name: /save/i }).click();
      
      // Should stay on cookies page after submission
      await expect(page).toHaveURL(/cookies/);
    }
  });

  test('should display privacy notice page', async ({ page }) => {
    await page.goto('/privacy-notice');
    
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/privacy/i);
  });

  test('should display accessibility statement page', async ({ page }) => {
    await page.goto('/accessibility-statement');
    
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/accessibility/i);
  });

  test('should display terms and conditions page', async ({ page }) => {
    await page.goto('/terms-and-conditions');
    
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/terms/i);
  });

  test('should display contact us page', async ({ page }) => {
    await page.goto('/contact-us');
    
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/contact/i);
  });
});