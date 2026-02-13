import { test, expect, Page } from '@playwright/test';
 
import { navigateToTaskList, expectErrorSummaryVisible} from './fixtures/test-helpers';
 
async function fillToWhichDaysOvernight(page: Page) {
  await page.getByLabel('With Parent').check();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByLabel('Yes').check();
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page).toHaveURL(/which-days-overnight/);
}

async function fillToWillDaytimeVisitsHappen(page: Page) {
  await page.getByLabel(/Monday/i).check();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByLabel(/Yes/i).check();
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page).toHaveURL(/which-days-daytime-visits/);
}

async function chooseAnotherArrangementAndContinue(page: Page) {
  await page.getByText('Another arrangement').click();
  await page.getByRole('button', { name: /continue/i }).click();
}

async function fillToWhichScehduleIsBestPageAndContinue(page: Page) {
  await page.getByLabel('They will split time between Parent and Guardian').check();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
}

test.describe('Mostly Lives Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
    await page.getByRole('link', { name: /where will the children mostly live/i }).click();
  });
 
  // Playwright usually uses error ID's to locate error messages, but here errors are inside visually hidden elements, so ID does not work and getByText is used instead.
  // Two non essential error tests are not included here, testing wether an error messsage is inside a form group, and wether it has the right aria attribute, this is because ID has to be used for these tests.
  test.describe('Child mostly lives with Adult 1 and has other arrangements with Adult 2: Error Validation', () => {
    test('An error should be shown for when Another Arrangment is left blank on the mostly lives page, the days overnight page, and the daytime visits page, and when options are left blank on these pages. ', async ({ page }) => {
      await chooseAnotherArrangementAndContinue(page)
      await expect( page.getByText("Describe the living arrangement you are proposing").nth(0) ).toBeVisible()
      
      await fillToWhichDaysOvernight(page)
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("Select which days overnights will happen on").nth(0) ).toBeVisible()
      await chooseAnotherArrangementAndContinue(page)
      await expect( page.getByText("Describe when the children will stay overnight").nth(0) ).toBeVisible()

      await fillToWillDaytimeVisitsHappen(page)
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("Select when daytime visits will happen").nth(0) ).toBeVisible()
      await chooseAnotherArrangementAndContinue(page)
      await expect( page.getByText("Describe when daytime visits will happen").nth(0) ).toBeVisible()
    });
  
    test('should display error summary at the top of the page', async ({ page }) => {
      await chooseAnotherArrangementAndContinue(page)
      await expectErrorSummaryVisible(page);

      await fillToWhichDaysOvernight(page)   
      await page.getByRole('button', { name: /continue/i }).click();
      await expectErrorSummaryVisible(page);
      chooseAnotherArrangementAndContinue(page)
      await expectErrorSummaryVisible(page);

      await fillToWillDaytimeVisitsHappen(page)   
      await page.getByRole('button', { name: /continue/i }).click();
      await expectErrorSummaryVisible(page);
      await chooseAnotherArrangementAndContinue(page)
      await expectErrorSummaryVisible(page);
    });

    test('should scroll to the textbox or feildset when clicking the error summary link', async ({ page }) => {
      await chooseAnotherArrangementAndContinue(page)
      await page.getByText("Describe the living arrangement you are proposing").nth(0).click();
      await expect( page.getByRole('textbox', { name: "Describe the arrangement" }) ).toBeInViewport();

      await fillToWhichDaysOvernight(page) 
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByText("Select which days overnights will happen on").nth(0).click();
      await expect( page.getByRole('heading', { name: 'On which days will overnights happen?' }) ).toBeInViewport();
      chooseAnotherArrangementAndContinue(page)
      await page.getByText("Describe when the children will stay overnight").nth(0).click();
      await expect( page.getByRole('textbox', { name: "Describe the arrangement" }) ).toBeInViewport();

      await fillToWillDaytimeVisitsHappen(page)
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByText(" Select when daytime visits will happen").nth(0).click();
      await expect( page.getByRole('heading', { name: 'On which days will daytime visits happen?' }) ).toBeInViewport();
      await chooseAnotherArrangementAndContinue(page)
      await page.getByText("Describe when daytime visits will happen").nth(0).click();
      await expect( page.getByRole('textbox', { name: "Describe the arrangement" }) ).toBeInViewport();
    });
   });

  test.describe('Child splits time between Adult 1 and Adult 2: Error Validation', () => {
    test('An error should be shown for an empty text area, about which shecdule is best for the child', async ({ page }) => {
      await fillToWhichScehduleIsBestPageAndContinue(page)
      await expect( page.getByText("Describe which schedule will best meet the children's needs").nth(0) ).toBeVisible()
    });

    test('should display error summary at the top of the page', async ({ page }) => {
       await fillToWhichScehduleIsBestPageAndContinue(page)
       await expectErrorSummaryVisible(page);
    });

    test('should display error summary link that links to the textbox field', async ({ page }) => {
      await fillToWhichScehduleIsBestPageAndContinue(page)
      await page.getByText("Describe which schedule will best meet the children's needs").nth(0).click();
      await expect(page.getByRole('textbox')).toBeInViewport();
    });
  });
});