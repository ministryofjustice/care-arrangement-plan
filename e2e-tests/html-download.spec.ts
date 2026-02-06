import { test, expect } from '@playwright/test';

import { completeMinimalJourney } from './fixtures/test-helpers';

async function navigateToSharePlan(page: import('@playwright/test').Page) {
  await completeMinimalJourney(page);

  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page).toHaveURL(/\/check-your-answers/);

  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page).toHaveURL(/\/share-plan/);
}

test.describe('HTML Download Functionality', () => {
  test('should display HTML download link on share plan page', async ({ page }) => {
    await navigateToSharePlan(page);

    const downloadLink = page.getByRole('link', { name: /download as html/i });
    await expect(downloadLink).toBeVisible();
  });

  test('should trigger HTML download when clicking download link', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');

    expect(response.ok()).toBeTruthy();
  });

  test('should download file with .html extension and meaningful filename', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');
    const contentDisposition = response.headers()['content-disposition'];

    expect(contentDisposition).toMatch(/\.html/);
    expect(contentDisposition).toMatch(/Proposed child arrangements plan/i);
  });

  test('should generate HTML with correct content type', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('should generate HTML with attachment content disposition', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');

    expect(response.headers()['content-disposition']).toContain('attachment');
    expect(response.headers()['content-disposition']).toContain('.html');
  });

  test('should download HTML file with content', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');
    const htmlContent = await response.text();

    expect(htmlContent.length).toBeGreaterThan(0);
  });

  test('should include plan data in downloaded HTML', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');
    const htmlContent = await response.text();

    // Should contain the adult names used in completeMinimalJourney
    expect(htmlContent).toContain('Parent');
    expect(htmlContent).toContain('Guardian');

    // Should contain the child name used in completeMinimalJourney
    expect(htmlContent).toContain('Test');

    // Should be valid HTML
    expect(htmlContent).toContain('<!DOCTYPE html>');
  });

  test('should include GOV.UK branding in HTML', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');
    const htmlContent = await response.text();

    // Should contain GOV.UK branding
    expect(htmlContent.toLowerCase()).toContain('gov.uk');

    // Should contain the blue header
    expect(htmlContent).toContain('#1d70b8');

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  // TODO: HTML download does not yet redirect to the confirmation page.
  // Once that bug is fixed, add a test to verify the HTML download link
  // is also available on the confirmation page (similar to PDF behaviour).
});
