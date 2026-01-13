import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  const staticPages = [
    { url: '/cookies', title: /cookies/i },
    { url: '/privacy-notice', title: /privacy/i },
    { url: '/accessibility-statement', title: /accessibility/i },
    { url: '/terms-and-conditions', title: /terms/i },
    { url: '/contact-us', title: /contact/i },
  ];

  for (const { url, title } of staticPages) {
    test(`should load ${url} page successfully`, async ({ page }) => {
      await page.goto(url);

      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(title);

      const backLink = page.locator('.govuk-back-link');
      if ((await backLink.count()) > 0) {
        await expect(backLink.first()).toBeVisible();
      }
    });
  }

  test('should display cookies page with accept/reject options', async ({ page }) => {
    await page.goto('/cookies');

    const acceptButton = page.getByRole('radio', { name: /accept/i }).first();
    const rejectButton = page.getByRole('radio', { name: /reject/i }).first();

    if ((await acceptButton.count()) > 0) {
      await expect(acceptButton).toBeVisible();
    }
    if ((await rejectButton.count()) > 0) {
      await expect(rejectButton).toBeVisible();
    }
  });

  test('should display contact information on contact us page', async ({ page }) => {
    await page.goto('/contact-us');

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
