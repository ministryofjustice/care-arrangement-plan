import { test, expect } from '@playwright/test';

test.describe('Welsh language support', () => {
  test('should switch to Welsh when clicking the Welsh link on the homepage', async ({ page }) => {
    await page.goto('/');

    const welshLink = page.getByRole('link', { name: /Welsh \(Cymraeg\)/i });
    await expect(welshLink).toBeVisible();
    await welshLink.click();

    await expect(page).toHaveURL(/\?lang=cy/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
  });

  test('should persist Welsh language across page navigations', async ({ page }) => {
    // Set Welsh on the homepage
    await page.goto('/?lang=cy');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');

    // Navigate to accessibility statement — should still be Welsh
    await page.goto('/accessibility-statement');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(page.locator('h1')).toContainText('Datganiad hygyrchedd');
  });

  test('should persist Welsh language on contact us page', async ({ page }) => {
    await page.goto('/?lang=cy');

    await page.goto('/contact-us');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(page.locator('h1')).toContainText('Cysylltu â ni');
  });

  test('should persist Welsh language on privacy notice page', async ({ page }) => {
    await page.goto('/?lang=cy');

    await page.goto('/privacy-notice');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(page.locator('h1')).toContainText('Hysbysiad Preifatrwydd');
  });

  test('should persist Welsh language on terms and conditions page', async ({ page }) => {
    await page.goto('/?lang=cy');

    await page.goto('/terms-and-conditions');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(page.locator('h1')).toContainText('Telerau ac amodau');
  });

  test('should switch back to English with ?lang=en', async ({ page }) => {
    await page.goto('/?lang=cy');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');

    await page.goto('/?lang=en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/Propose a child arrangements plan/);
  });
});
