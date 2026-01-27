import fs from 'fs';
import path from 'path';

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
    
    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/check-your-answers/);

    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/share-plan/);

    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click the download PDF link
    await page.getByRole('button', { name: /Download Plan as PDF/i }).first().click();

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download was triggered
    expect(download).toBeTruthy();
  });

    test('should trigger HTML download when clicking download button', async ({ page }) => {
    await completeMinimalJourney(page);
    
    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/check-your-answers/);

    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/share-plan/);

    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click the download HTML link
    await page.getByRole('link', { name: /Download as HTML*/i }).first().click();

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download was triggered
    expect(download).toBeTruthy();
  });


  test('should download file with appropriate filename', async ({ page }) => {
    await completeMinimalJourney(page);
    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/check-your-answers/);

    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/share-plan/);

    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click the download PDF link
    await page.getByRole('button', { name: /Download Plan as PDF/i }).first().click();

    // Wait for download to start
    const download = await downloadPromise;

    // Get the suggested filename
    const filename = download.suggestedFilename();

    // Should not be generic "download.pdf"
    expect(filename).not.toBe('download.pdf');

    // Should end with .pdf
    expect(filename).toMatch(/Proposed child arrangements plan*/);

    // Should contain meaningful name (e.g., "child-arrangements-plan.pdf" or similar)
    expect(filename.length).toBeGreaterThan(4); // More than just ".pdf"
  });

  test('should download PDF file successfully', async ({ page }) => {
    await completeMinimalJourney(page);
    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/check-your-answers/);

    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/share-plan/);

    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click the download PDF link
    await page.getByRole('button', { name: /Download Plan as PDF/i }).first().click();

    // Wait for download to start
    const download = await downloadPromise;

    // Save to temporary location
    const downloadPath = path.join(__dirname, '../playwright-downloads', download.suggestedFilename());

    // Ensure directory exists
    const dir = path.dirname(downloadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await download.saveAs(downloadPath);

    // Verify file exists and has content
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should generate PDF with correct content type', async ({ page }) => {
    await completeMinimalJourney(page);
    await page.goto('/share-plan');

    // Make a direct request to the download endpoint
    const response = await page.request.get('/download-pdf');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('should include GOV.UK branding in PDF', async ({ page }) => {
    await completeMinimalJourney(page);
    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/check-your-answers/);

    // Click continue to go to share plan page
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/share-plan/);

    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click the download PDF link
    await page.getByRole('button', { name: /Download Plan as PDF/i }).first().click();

    // Wait for download to start
    const download = await downloadPromise;

    const downloadPath = path.join(__dirname, '../playwright-downloads', 'test-branding.pdf');
    const dir = path.dirname(downloadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await download.saveAs(downloadPath);

    const pdfBuffer = fs.readFileSync(downloadPath);
    const pdfString = pdfBuffer.toString('utf-8');

    // Check for GOV.UK branding elements
    expect(pdfString.toLowerCase()).toContain('gov.uk');

    // Clean up
    fs.unlinkSync(downloadPath);
  });
});
