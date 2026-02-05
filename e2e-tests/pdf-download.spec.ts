import { test, expect } from '@playwright/test';

import { completeMinimalJourney } from './fixtures/test-helpers';

test.describe('PDF Download Functionality', () => {
  test('should display download options on share plan page after completing journey', async ({ page }) => {
    await completeMinimalJourney(page);

    // Navigate to check your answers
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/check-your-answers/);

    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/share-plan/);

    // Verify download button/link appears
    const downloadPdfLink = page.getByRole('button', { name: /Download Plan as PDF/i });
    const downloadHTMLLink = page.getByRole('link', { name: /Download as HTML*/i });
    await expect(downloadPdfLink).toBeVisible();
    await expect(downloadHTMLLink).toBeVisible();
  });

  test('should trigger PDF download when clicking download button', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-pdf');

    expect(response.ok()).toBeTruthy();
  });

  test('should trigger HTML download when clicking download button', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');

    expect(response.ok()).toBeTruthy();
  });

  test('should download file with appropriate filename', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-pdf');
    const contentDisposition = response.headers()['content-disposition'];

    // Should contain meaningful name
    expect(contentDisposition).toMatch(/Proposed child arrangements plan/i);

    // Should end with .pdf
    expect(contentDisposition).toMatch(/\.pdf/);
  });

  test('should download PDF file successfully', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-pdf');
    const pdfBuffer = await response.body();

    // Verify file has content
    expect(pdfBuffer.length).toBeGreaterThan(0);

    // Verify it starts with PDF magic bytes
    expect(pdfBuffer.toString('utf-8', 0, 5)).toBe('%PDF-');
  });

  test('should generate PDF with correct content type', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-pdf');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('should include GOV.UK branding in PDF', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-pdf');
    const pdfBuffer = await response.body();
    const pdfString = pdfBuffer.toString('utf-8');

    // Check for GOV.UK branding elements
    expect(pdfString.toLowerCase()).toContain('gov.uk');
  });
});
