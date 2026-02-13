import { test, expect, Page } from '@playwright/test';
 
import { navigateToTaskList, fillHandoversAndHolidaySectionAndContinue, checkDataPersistsAndContinue, expectErrorSummaryVisible} from './fixtures/test-helpers';

async function checkIfTaskStatusIsCompleted(page: Page) {
  await expect(page.locator('#handoverAndHolidays-taskList-1-status')).toHaveText(/Completed/i);
  await expect(page.locator('#handoverAndHolidays-taskList-2-status')).toHaveText(/Completed/i);
  await expect(page.locator('#handoverAndHolidays-taskList-3-status')).toHaveText(/Completed/i);
  await expect(page.locator('#handoverAndHolidays-taskList-4-status')).toHaveText(/Completed/i);
}

async function fillTextAreaAndContinue(page: Page, textAreaText: string) {
  await page.fill('textarea', textAreaText);
  await page.getByRole('button', { name: /continue/i }).click();
}
 
test.describe('Handovers and holidays section', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
    // navigateToTaskList causes Adult 1 to be named Parent and Adult 2 to be Guardian, so they are mentioned throughout the test.
  });
 
  test.describe('Adult 1 collects the children, handovers take place between adults, arrangments change in school holidays, and items go between households', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await fillHandoversAndHolidaySectionAndContinue(page, /get-between-households/, 'How will the children get between households?', ['Parent collects the children'])
      await fillHandoversAndHolidaySectionAndContinue(page, /where-handover/, 'Where does handover take place?', ['Neutral location', "At Parent's home", "At Guardian's home", 'At school'])
      await fillHandoversAndHolidaySectionAndContinue(page, /will-change-during-school-holidays/, 'Will these arrangements change during school holidays?', ['Yes'])
      await fillHandoversAndHolidaySectionAndContinue(page, /how-change-during-school-holidays/, 'How will the arrangements be different in school holidays?')
      await fillTextAreaAndContinue(page, "We will alternate holidays")
      await fillHandoversAndHolidaySectionAndContinue(page, /items-for-changeover/, 'What items need to go between households?')
      await fillTextAreaAndContinue(page, "School bag, clothes, favorite toys")
      await expect(page).toHaveURL(/\/make-a-plan/);
      await checkIfTaskStatusIsCompleted(page)

      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await checkDataPersistsAndContinue(page, ['Parent collects the children'])
      await checkDataPersistsAndContinue(page, ['Neutral location', "At Parent's home", "At Guardian's home", 'At school'])
      await checkDataPersistsAndContinue(page, ['Yes'])
      await checkDataPersistsAndContinue(page, [],  true, 'We will alternate holidays')
      await checkDataPersistsAndContinue(page, [],  true, 'School bag, clothes, favorite toys')
    });
  });

  test.describe('Adult 2 collects the children, handovers take place by someone else, arrangments do not change in school holidays, and items go between households', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await fillHandoversAndHolidaySectionAndContinue(page, /get-between-households/, 'How will the children get between households?', ['Guardian collects the children'])
      await fillHandoversAndHolidaySectionAndContinue(page, /where-handover/, 'Where does handover take place?', ['Someone else will manage handover, such as a grandparent'])
      await fillTextAreaAndContinue(page, "Grandparent handles handover")
      await fillHandoversAndHolidaySectionAndContinue(page, /will-change-during-school-holidays/, 'Will these arrangements change during school holidays?', ['No'])
      await fillHandoversAndHolidaySectionAndContinue(page, /items-for-changeover/, 'What items need to go between households?')
      await page.fill('textarea', 'School bag, clothes, favorite toys');
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await checkIfTaskStatusIsCompleted(page)

      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await checkDataPersistsAndContinue(page, ['Guardian collects the children'])
      await checkDataPersistsAndContinue(page, ["Someone else will manage handover, such as a grandparent"], true, "Grandparent handles handover")
      await checkDataPersistsAndContinue(page, ['No'])
      await checkDataPersistsAndContinue(page, [],  true, 'School bag, clothes, favorite toys')
    });
  });

   test.describe('Another arrangement is made for collecting the children, then both Adults decide that no decsion needs to be made, for collecting the children, for handovers, for arrangments in school holidays, and what items go between households', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await fillHandoversAndHolidaySectionAndContinue(page, /get-between-households/, 'How will the children get between households?')
      await page.getByLabel(/Another arrangement/).check();
      await fillTextAreaAndContinue(page, "Grandmother collects the children")
      await page.locator('.govuk-back-link').click();
      await page.getByRole('button', { name: /We do not need to decide how the children get between households/i }).click();
      await page.getByRole('button', { name: /We do not need to decide where handover takes place/i }).click();
      await page.getByRole('button', { name: /We do not need to decide how arrangements change during school holidays/i }).click();
      await page.getByRole('button', { name: /We do not need to decide what items need to go between households/i }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await checkIfTaskStatusIsCompleted(page)
    });
  });


// Playwright usually uses error ID's to locate error messages, but here errors are inside visually hidden elements, so ID does not work and getByText is used instead.
// Two non essential error tests are not included here, testing wether an error messsage is inside a form group, and wether it has the right aria attribute, this is because ID has to be used for these tests.
  test.describe('An error should be shown if no options are chosen and another arrangement is not specified on the get between households page', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({ page }) => {
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("Select who will be responsible for getting the children").nth(0) ).toBeVisible()
      await expectErrorSummaryVisible(page);
      await page.getByText("Select who will be responsible for getting the children").nth(0).click();
      await expect( page.getByRole('heading', { name: 'How will the children get between households?' }) ).toBeInViewport();

      await page.getByText('Another arrangement').click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("Describe how the children will get between households").nth(0) ).toBeVisible()
      await expectErrorSummaryVisible(page);
      await page.getByText("Describe how the children will get between households").nth(0).click();
      await expect( page.getByRole('textbox', { name: "Describe the arrangement" }) ).toBeInViewport();
    });
  });

  test.describe('An error should be shown if no options are chosen and someone else is not specified on the handovers page', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({ page }) => {
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await page.getByLabel(/Parent collects the children/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("Select where handover takes place").nth(0) ).toBeVisible()
      await expectErrorSummaryVisible(page);
      await page.getByText("Select where handover takes place").nth(0).click();
      await expect(page.getByRole('checkbox', { name: "Neutral location" })).toBeInViewport();

      await page.getByText('Someone else will manage handover, such as a grandparent').click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("Describe who will manage handover").nth(0) ).toBeVisible()
      await expectErrorSummaryVisible(page);
      await page.getByText("Describe who will manage handover").nth(0).click();
      await expect( page.getByRole('textbox', { name: "Name of the person who will manage handover" }) ).toBeInViewport();
    });
  });

  test.describe('An error should be shown if no options are chosen on the will arrangemetns change in shchool holidays page', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({ page }) => {
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await page.getByLabel(/Parent collects the children/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/Neutral location/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("Choose whether the arrangements will change").nth(0) ).toBeVisible()
      await expectErrorSummaryVisible(page);
      await page.getByText("oose whether the arrangements will change").nth(0).click();
      await expect( page.getByRole('heading', { name: 'Will these arrangements change during school holidays?' }) ).toBeInViewport();
    });
  });

  test.describe('An error should be shown when a differnet ararangement for collection in school holidays is not given', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({ page }) => {
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await page.getByLabel(/Parent collects the children/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/Neutral location/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/Yes/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("Describe the arrangement you are proposing").nth(0) ).toBeVisible()
      await expectErrorSummaryVisible(page);
      await page.getByText("Describe the arrangement you are proposing").nth(0).click();
      await expect(page.getByRole('textbox')).toBeInViewport();
    });
  });

  test.describe('An error should be shown when a items for changeovers is not specified', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({ page }) => {
      await page.getByRole('link', { name: /how will the children get between households/i }).click();
      await page.getByLabel(/Parent collects the children/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/Neutral location/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/No/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect( page.getByText("List which items need to go between households").nth(0) ).toBeVisible()
      await expectErrorSummaryVisible(page);
      await page.getByText("List which items need to go between households").nth(0).click();
      await expect(page.getByRole('textbox')).toBeInViewport();
    });
  });
});