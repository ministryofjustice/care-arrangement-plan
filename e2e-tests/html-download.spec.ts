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
  });

  test('should include version number in downloaded HTML', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');
    const htmlContent = await response.text();

    expect(htmlContent).toMatch(/v\d+\.\d+\.\d+/);
  });

  test('should include section 9 end of form content in the downloaded HTML', async ({ page }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');
    const htmlContent = await response.text();

    expect(response.status()).toBe(200);
    expect(htmlContent).toContain('<section id="what-happens-now"');
    expect(htmlContent).toContain('Section 9');
    expect(htmlContent).toContain('End of form');
    expect(htmlContent).toContain('Is there anything else you would like to suggest for the child arrangements plan?');
    expect(htmlContent).toContain('id="end-of-form-other-information"');
    expect(htmlContent).toContain('Joint agreement');
    expect(htmlContent).toContain('name="jointAgreementName1"');
    expect(htmlContent).toContain('name="jointAgreementSignature2"');
    expect(htmlContent).toContain('name="jointAgreementDate1"');
    expect(htmlContent).toContain('Legal status of this agreement');
    expect(htmlContent).toContain('href="https://www.gov.uk/find-legal-advice"');
    expect(htmlContent).toContain('What to do next');
    expect(htmlContent).toContain('Any plan you make using this form is not legally binding.');
    expect(htmlContent).toContain('If you cannot reach an agreement');
    expect(htmlContent).toContain('href="https://www.gov.uk/find-ways-to-make-child-arrangements"');
    expect(htmlContent).toContain('href="https://www.gov.uk/looking-after-children-divorce"');
    expect(htmlContent).toContain('Get paid to give your feedback');
    expect(htmlContent).toContain('href="https://www.smartsurvey.co.uk/s/EFO5FJ/"');
  });

  test('should include education, health, travel, special days, other things, and decision making', async ({
    page,
  }) => {
    await completeMinimalJourney(page);

    const response = await page.request.get('/download-html');
    const htmlContent = await response.text();

    expect(response.status()).toBe(200);
    expect(htmlContent).toContain('id="education"');
    expect(htmlContent).toContain('Section 4');
    expect(htmlContent).toContain('How should information from the school be shared?');
    expect(htmlContent).toContain('Both parents will receive information');
    expect(htmlContent).toContain('Both parents will attend');
    expect(htmlContent).toContain('id="child-health"');
    expect(htmlContent).toContain('Section 5');
    expect(htmlContent).toContain('Regular check-ups and an inhaler when needed');
    expect(htmlContent).toContain('At least 4 weeks');
    expect(htmlContent).toContain('Clothes and shoes');
    expect(htmlContent).toContain('We will alternate holidays');
    expect(htmlContent).toContain('<h1 class="section-heading-title">Section 6</h1>');
    expect(htmlContent).toContain('We will share birthdays and holidays equally');
    expect(htmlContent).toContain('<h1 class="section-heading-title">Section 7</h1>');
    expect(htmlContent).toContain('Regular communication about the children');
    expect(htmlContent).toContain('<h1 class="section-heading-title">Section 8</h1>');
    expect(htmlContent).toContain('with a phone call');
    expect(htmlContent).toContain('2 weeks&#039; notice');
    expect(htmlContent).toContain('6 months&#039; time');
    expect(htmlContent).not.toContain('End of section');
  });

  // TODO: HTML download does not yet redirect to the confirmation page.
  // Once that bug is fixed, add a test to verify the HTML download link
  // is also available on the confirmation page (similar to PDF behaviour).
});
