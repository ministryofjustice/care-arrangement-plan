import { test, devices, expect, Page } from '@playwright/test';

const mobileDevices = [
  { name: 'iPhone 12', config: devices['iPhone 12'] },
  { name: 'iPhone 13', config: devices['iPhone 13'] },
  { name: 'iPhone 14', config: devices['iPhone 14'] },
  { name: 'iPad Pro 11', config: devices['iPad Pro 11'] },
  { name: 'Pixel 5', config: devices['Pixel 5'] },
  { name: 'Pixel 7', config: devices['Pixel 7'] },
  { name: 'Galaxy S8', config: devices['Galaxy S8'] },
];

async function assertNoHorizontalScroll(page: Page) {
  const html = await page.$('html');
  const hasHorizontalScroll = await html!.evaluate(el => el.scrollWidth > el.clientWidth);
  expect(hasHorizontalScroll).toBe(false);
}

for (const device of mobileDevices) {
  test.describe(device.name, () => {
    // isMobile is Chromium-only; strip it (and defaultBrowserType) so tests run
    // across all browsers using the correct viewport, userAgent and hasTouch settings.
    const { defaultBrowserType: _dbt, isMobile: _im, ...deviceConfig } = device.config;
    test.use(deviceConfig);

    test('Multiple Mobile Devices of differnet viewports can navigate through the service', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).tap();

      // safety-check
      await page.getByLabel(/yes/i).first().check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // children-saftey-check
      await page.getByLabel(/yes/i).first().check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // do-whats-best
      await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // court order check
      await page.getByLabel(/no/i).first().check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // number of children
      await page.getByLabel(/How many children is this for/i).fill('1');
      await page.getByRole('button', { name: /continue/i }).tap();

      // about the children
      await page.getByLabel(/first name of the child/i).fill('test');
      await page.getByRole('button', { name: /continue/i }).tap();

      // about the adults
      await page.fill('input[name="initial-adult-name"]', 'Parent');
      await page.fill('input[name="secondary-adult-name"]', 'Guardian');
      await page.getByRole('button', { name: /continue/i }).tap();

      // make-a-plan (Task List)
      await expect(page).toHaveURL(/\/make-a-plan/);
      await assertNoHorizontalScroll(page);
      await page.getByRole('link', { name: /where will the children mostly live/i }).tap();

      // where-will-the-children-mostly-live
      await page.getByLabel(/With Parent/i).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // will-overnights-happen
      await page.getByLabel(/Yes/i).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // which-days-overnight
      await page.getByLabel(/Another arrangement/i).check();
      await assertNoHorizontalScroll(page);
      await page.getByRole('textbox', { name: /Describe the arrangement/i }).scrollIntoViewIfNeeded();
      await page.getByLabel('Describe the arrangement').fill('Test');
      await page.getByRole('button', { name: /continue/i }).tap();

      // will-daytime-visits-happen
      await page.getByLabel(/Yes/i).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // which-days-daytime-visits
      await page.getByLabel(/Another arrangement/i).check();
      await assertNoHorizontalScroll(page);
      await page.getByRole('textbox', { name: /Describe the arrangement/i }).scrollIntoViewIfNeeded();
      await page.getByLabel('Describe the arrangement').fill('Test');
      await page.getByRole('button', { name: /continue/i }).tap();

      // make-a-plan (Task List)
      await expect(page).toHaveURL(/\/make-a-plan/);
      await page.getByRole('link', { name: /How will the children get between households/i }).tap();

      // get-between-households
      await page.getByLabel(/Parent collects the children/i).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // where-handover
      await page.getByLabel(/Neutral location/i).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // will-change-during-school-holidays
      await page.getByLabel(/Yes/i).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // how-change-during-school-holidays
      await page.fill('textarea', 'test');
      await page.getByRole('button', { name: /continue/i }).tap();

      // items-for-changeover
      await page.fill('textarea', 'test');
      await page.getByRole('button', { name: /continue/i }).tap();

      // make-a-plan (Task List)
      await expect(page).toHaveURL(/\/make-a-plan/);
      await page.getByRole('link', { name: /What will happen on special days/i }).scrollIntoViewIfNeeded();
      await page.getByRole('link', { name: /What will happen on special days/i }).tap();

      // what-will-happen
      await page.fill('textarea', 'test');
      await page.getByRole('button', { name: /continue/i }).tap();

      // make-a-plan (Task List)
      await expect(page).toHaveURL(/\/make-a-plan/);
      await page.getByRole('link', { name: /What other things matter to your children/i }).scrollIntoViewIfNeeded();
      await page.getByRole('link', { name: /What other things matter to your children/i }).tap();

      // what-other-things-matter
      await page.fill('textarea', 'test');
      await page.getByRole('button', { name: /continue/i }).tap();

      // make-a-plan (Task List)
      await expect(page).toHaveURL(/\/make-a-plan/);
      await page.getByRole('link', { name: /How should last-minute changes be communicated/i }).scrollIntoViewIfNeeded();
      await page.getByRole('link', { name: /How should last-minute changes be communicated/i }).tap();

      // plan-last-minute-changes
      await page.getByLabel(/By Text Message/i).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // plan-long-term-notice
      await page.getByLabel(/2 weeks/i).check();
      await page.getByRole('button', { name: /continue/i }).tap();

      // plan-review
      await page.fill('input[name="plan-review-months"]', '2');
      await page.getByRole('button', { name: /continue/i }).tap();

      // make-a-plan (Task List)
      await expect(page).toHaveURL(/\/make-a-plan/);
      await page.getByRole('button', { name: /continue/i }).scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: /continue/i }).tap();

      // check-your-answers
      await expect(page).toHaveURL(/\/check-your-answers/);
      await assertNoHorizontalScroll(page);
      await page.getByRole('button', { name: /continue/i }).scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: /continue/i }).tap();

      // share-plan
      await expect(page).toHaveURL(/\/share-plan/);
      await assertNoHorizontalScroll(page);
      await page.getByRole('button', { name: /Download plan as PDF/i }).tap();
    });
  });
}
