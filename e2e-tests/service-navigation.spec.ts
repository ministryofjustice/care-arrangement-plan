import { test, expect } from '@playwright/test';

import { staticPages } from './fixtures/test-data';
import { startJourney, navigateToTaskList } from './fixtures/test-helpers';

const SERVICE_URL = 'http://localhost:3001';
const SERVICE_NAME_EN = 'Propose a child arrangements plan';
const SERVICE_NAME_CY = 'Cynnig cynllun trefniant plentyn';

test.describe('Service navigation', () => {
  test('should display service name and link on the homepage', async ({ page }) => {
    await page.goto('/');

    const serviceNavigation = page.locator('.govuk-service-navigation');
    await expect(serviceNavigation).toBeVisible();
    await expect(serviceNavigation).toHaveAttribute('data-module', 'govuk-service-navigation');

    const serviceLink = serviceNavigation.getByRole('link', { name: SERVICE_NAME_EN });
    await expect(serviceLink).toBeVisible();
    await expect(serviceLink).toHaveAttribute('href', SERVICE_URL);
  });

  test('should display service navigation on journey pages', async ({ page }) => {
    await startJourney(page);

    const serviceLink = page.locator('.govuk-service-navigation__link');
    await expect(serviceLink).toBeVisible();
    await expect(serviceLink).toHaveText(SERVICE_NAME_EN);
    await expect(serviceLink).toHaveAttribute('href', SERVICE_URL);
  });

  test('should display service navigation on the task list', async ({ page }) => {
    await navigateToTaskList(page);

    const serviceLink = page.locator('.govuk-service-navigation__link');
    await expect(serviceLink).toBeVisible();
    await expect(serviceLink).toHaveText(SERVICE_NAME_EN);
    await expect(serviceLink).toHaveAttribute('href', SERVICE_URL);
  });

  for (const staticPage of staticPages) {
    test(`should display service navigation on ${staticPage.name}`, async ({ page }) => {
      await page.goto(staticPage.path);

      const serviceLink = page.locator('.govuk-service-navigation__link');
      await expect(serviceLink).toBeVisible();
      await expect(serviceLink).toHaveText(SERVICE_NAME_EN);
      await expect(serviceLink).toHaveAttribute('href', SERVICE_URL);
    });
  }

  test('should display Welsh service name when language is Welsh', async ({ page }) => {
    await page.goto('/?lang=cy');

    const serviceLink = page.locator('.govuk-service-navigation__link');
    await expect(serviceLink).toBeVisible();
    await expect(serviceLink).toHaveText(SERVICE_NAME_CY);
    await expect(serviceLink).toHaveAttribute('href', SERVICE_URL);
  });
});
