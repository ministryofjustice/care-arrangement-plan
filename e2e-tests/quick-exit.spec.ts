import { test, expect } from '@playwright/test';

import { startJourney } from './fixtures/test-helpers';

test.describe('Exit the page from saftey check page', () => {
  test('Page should navigate to BBC Weather when "Exit this page" is clicked, and not have the URL I navigated from.', async ({ page }) => {
      await startJourney(page)
      await expect(page).toHaveURL(/safety-check/i);

      const exit = page.getByRole('button', { name: /exit this page/i });
      await expect(exit).toBeVisible();
      await exit.click();

      await page.goto('https://www.bbc.co.uk/weather');
      await expect(page).not.toHaveURL(/safety-check/i);
      await expect(page).toHaveURL(/bbc\.(co\.uk|com)\/weather/);
  });
});

test.describe('Exit the page from not-safe page', () => {
  test('When I choose no to the saftey check, then I should see the not-safe page and be able to exit the page to BBC Weather, and not see the URL I navigated from', async ({ page }) => {
      await startJourney(page)
      await expect(page).toHaveURL(/safety-check/i);
      await page.getByLabel(/no/i).first().check();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/not-safe/i);

      const exit = page.getByRole('button', { name: /exit this page/i });
      await expect(exit).toBeVisible();
      await exit.click();

      await page.goto('https://www.bbc.co.uk/weather');
      await expect(page).not.toHaveURL(/not-safe/i);
      await expect(page).toHaveURL(/bbc\.(co\.uk|com)\/weather/);
  });
});

test.describe('Exit the page from child safety check page', () => {
  test('Page should navigate to BBC Weather when "Exit this page" is clicked, and not have the URL I navigated from.', async ({ page }) => {
      await startJourney(page)
      await expect(page).toHaveURL(/safety-check/i);
      await page.getByLabel(/yes/i).first().check();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/children-safety-check/i);

      const exit = page.getByRole('button', { name: /exit this page/i });
      await expect(exit).toBeVisible();
      await exit.click();

      await page.goto('https://www.bbc.co.uk/weather');
      await expect(page).not.toHaveURL(/children-safety-check/i);
      await expect(page).toHaveURL(/bbc\.(co\.uk|com)\/weather/);
  });
});

test.describe('Exit the page from children not-safe page', () => {
  test('When I choose no to the child saftey check, then I should see the children-not-safe page and be able to exit the page to BBC Weather, and not see the URL I navigated from.', async ({ page }) => {
      await startJourney(page)
      await expect(page).toHaveURL(/safety-check/i);
      await page.getByLabel(/yes/i).first().check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/no/i).first().check();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/children-not-safe/i);

      const exit = page.getByRole('button', { name: /exit this page/i });
      await expect(exit).toBeVisible();
      await exit.click();

      await page.goto('https://www.bbc.co.uk/weather');
      await expect(page).not.toHaveURL(/children-not-safe/i);
      await expect(page).toHaveURL(/bbc\.(co\.uk|com)\/weather/);
  });
});
