import { test, expect, Page } from '@playwright/test';

import {
  navigateToTaskList,
  fillHandoversAndHolidaySectionAndContinue,
  checkDataPersistsAndContinue,
  expectErrorSummaryVisible,
} from './fixtures/test-helpers';

async function checkIfTaskStatusIsCompleted(page: Page) {
  await expect(page.locator('#handoverAndHolidays-taskList-1-status')).toHaveText(/Completed/i);
  await expect(page.locator('#handoverAndHolidays-taskList-2-status')).toHaveText(/Completed/i);
  await expect(page.locator('#handoverAndHolidays-taskList-3-status')).toHaveText(/Completed/i);
  await expect(page.locator('#handoverAndHolidays-taskList-4-status')).toHaveText(/Completed/i);
}

async function fillTextAreaAndContinue(page: Page, textAreaText: string) {
  await page.locator('textarea:visible').fill(textAreaText);
  await page.getByRole('button', { name: /continue/i }).click();
}

test.describe('Handovers and holidays section', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
    // navigateToTaskList causes Adult 1 to be named Parent and Adult 2 to be Guardian, so they are mentioned throughout the test.
  });

  test.describe('Adult 1 collects the children, handovers take place between adults, arrangements change in school holidays, and items go between households', () => {
    test('Fill fields until section is complete', async ({ page }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await fillHandoversAndHolidaySectionAndContinue(
        page,
        /get-between-households/,
        /How will .* get between households\?/,
        ['Parent collects Test'],
      );
      await fillHandoversAndHolidaySectionAndContinue(page, /where-handover/, /Where will handover take place/, [
        'Neutral location',
        "At Parent's home",
        "At Guardian's home",
        'At school',
      ]);
      await fillHandoversAndHolidaySectionAndContinue(
        page,
        /will-change-during-school-holidays/,
        'Will these arrangements change during school holidays?',
        ['Yes'],
      );
      await fillHandoversAndHolidaySectionAndContinue(
        page,
        /how-change-during-school-holidays/,
        'How will the arrangements be different in school holidays?',
      );
      await fillTextAreaAndContinue(page, 'We will alternate holidays');
      await expect(page).toHaveURL(/items-for-changeover/);
      await expect(page.locator('h1')).toContainText('Which items should move between households?');
      await page.getByLabel('Clothes and shoes').check();
      await page.getByLabel('School items').check();
      await page.getByRole('checkbox', { name: 'Other items', exact: true }).check();
      await page.getByRole('textbox', { name: 'Describe the other items' }).fill('A favourite teddy');
      await page.getByRole('button', { name: 'Save and come back later' }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await checkIfTaskStatusIsCompleted(page);

      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await checkDataPersistsAndContinue(page, ['Parent collects Test']);
      await checkDataPersistsAndContinue(page, [
        'Neutral location',
        "At Parent's home",
        "At Guardian's home",
        'At school',
      ]);
      await checkDataPersistsAndContinue(page, ['Yes']);
      await checkDataPersistsAndContinue(page, [], true, 'We will alternate holidays');
      await expect(page.getByRole('checkbox', { name: 'Other items', exact: true })).toBeChecked();
      await checkDataPersistsAndContinue(page, ['Clothes and shoes', 'School items'], true, 'A favourite teddy');
    });
  });

  test.describe('Adult 2 collects the children, handovers take place at another (other) location, arrangements do not change in school holidays, and items go between households', () => {
    test('Fill fields until section is complete', async ({ page }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await fillHandoversAndHolidaySectionAndContinue(
        page,
        /get-between-households/,
        /How will .* get between households\?/,
        ['Guardian collects Test'],
      );
      await fillHandoversAndHolidaySectionAndContinue(page, /where-handover/, /Where will handover take place/, [
        'Other',
      ]);
      await fillTextAreaAndContinue(page, "Grandparent's house");
      await fillHandoversAndHolidaySectionAndContinue(
        page,
        /will-change-during-school-holidays/,
        'Will these arrangements change during school holidays?',
        ['No'],
      );
      await expect(page).toHaveURL(/items-for-changeover/);
      await expect(page.locator('h1')).toContainText('Which items should move between households?');
      await page.getByLabel('Clothes and shoes').check();
      await page.getByRole('button', { name: 'Save and come back later' }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await checkIfTaskStatusIsCompleted(page);

      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await checkDataPersistsAndContinue(page, ['Guardian collects Test']);
      await checkDataPersistsAndContinue(page, ['Other'], true, "Grandparent's house");
      await checkDataPersistsAndContinue(page, ['No']);
      await checkDataPersistsAndContinue(page, ['Clothes and shoes']);
    });
  });

  test.describe('"Other" can be combined with another handover location option', () => {
    test('Selecting "Other" alongside another option and providing free text completes the section', async ({
      page,
    }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await fillHandoversAndHolidaySectionAndContinue(
        page,
        /get-between-households/,
        /How will .* get between households\?/,
        ['Parent collects Test'],
      );
      await expect(page).toHaveURL(/where-handover/);
      await page.getByLabel('Neutral location').check();
      await page.getByLabel('Other').check();
      await page
        .getByRole('textbox', { name: /describe where handover will take place/i })
        .fill('The leisure centre car park');
      await page.getByRole('button', { name: /continue/i }).click();
      await fillHandoversAndHolidaySectionAndContinue(
        page,
        /will-change-during-school-holidays/,
        'Will these arrangements change during school holidays?',
        ['No'],
      );
      await expect(page).toHaveURL(/items-for-changeover/);
      await expect(page.locator('h1')).toContainText('Which items should move between households?');
      await page.getByLabel('School items').check();
      await page.getByRole('button', { name: 'Save and come back later' }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await checkIfTaskStatusIsCompleted(page);
    });
  });

  test.describe('Another arrangement is made for collecting the children, then both Adults decide that no decision needs to be made, for collecting the children, for handovers, for arrangements in school holidays, and what items go between households', () => {
    test('Fill fields until section is complete', async ({ page }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await fillHandoversAndHolidaySectionAndContinue(
        page,
        /get-between-households/,
        /How will .* get between households\?/,
      );
      await page.getByLabel(/Another arrangement/).check();
      await fillTextAreaAndContinue(page, 'Grandmother collects the children');
      await page.locator('.govuk-back-link').click();
      await page.getByRole('button', { name: /Skip this question/i }).click();
      await page.getByRole('button', { name: /Skip this question/i }).click();
      await page.getByRole('button', { name: /Skip this question/i }).click();
      await page.getByRole('button', { name: /Skip this question/i }).click();
      await expect(page).toHaveURL(/travel-abroad/);
      await page.goto('/make-a-plan');
      await expect(page).toHaveURL(/\/make-a-plan/);
      await checkIfTaskStatusIsCompleted(page);
    });
  });

  // Playwright usually uses error ID's to locate error messages, but here errors are inside visually hidden elements, so ID does not work and getByText is used instead.
  // Two non essential error tests are not included here, testing wether an error message is inside a form group, and wether it has the right aria attribute, this is because ID has to be used for these tests.
  test.describe('An error should be shown if no options are chosen and another arrangement is not specified on the get between households page', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({
      page,
    }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page.getByText('Select how the children will get between households').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Select how the children will get between households').nth(0).click();
      await expect(page.getByRole('heading', { name: /How will .* get between households\?/ })).toBeInViewport();

      await page.getByText('Another arrangement').click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page.getByText('Describe how the children will get between households').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Describe how the children will get between households').nth(0).click();
      await expect(page.getByRole('textbox', { name: 'Describe the arrangement' })).toBeInViewport();
    });
  });

  test.describe('An error should be shown if no options are chosen and the Other free text is not specified on the handovers page', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({
      page,
    }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await page.getByLabel(/Parent collects Test/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page.getByText('Select where handover takes place').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Select where handover takes place').nth(0).click();
      await expect(page.getByRole('checkbox', { name: 'Neutral location' })).toBeInViewport();

      await page.getByLabel('Other').check();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page.getByText('Describe where handover will take place').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Describe where handover will take place').nth(0).click();
      await expect(page.getByRole('textbox', { name: 'Describe where handover will take place' })).toBeInViewport();
    });
  });

  test.describe('An error should be shown if no options are chosen on the will arrangements change in school holidays page', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({
      page,
    }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await page.getByLabel(/Parent collects Test/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/Neutral location/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(
        page.getByText('Select whether the arrangements will change during school holidays').nth(0),
      ).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('select whether the arrangements will change during school holidays').nth(0).click();
      await expect(
        page.getByRole('heading', { name: 'Will these arrangements change during school holidays?' }),
      ).toBeInViewport();
    });
  });

  test.describe('An error should be shown when a different arrangement for collection in school holidays is not given', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({
      page,
    }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await page.getByLabel(/Parent collects Test/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/Neutral location/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/Yes/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page.getByText('Describe the arrangement you are proposing').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Describe the arrangement you are proposing').nth(0).click();
      await expect(page.getByRole('textbox')).toBeInViewport();
    });
  });

  test.describe('An error should be shown when a items for changeovers is not specified', () => {
    test('An error should be shown at the top of the page, above the blank option or text box, and when the error link is clicked it should link to the missing input', async ({
      page,
    }) => {
      await page.getByRole('link', { name: /how will .* get between households/i }).click();
      await page.getByLabel(/Parent collects Test/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/Neutral location/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/No/).check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(page.getByText('Select which items should move between households').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Select which items should move between households').nth(0).click();
      await expect(page.getByRole('heading', { name: 'Which items should move between households?' })).toBeInViewport();

      await page.getByRole('checkbox', { name: 'Other items', exact: true }).check();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(page.getByText('Describe the other items').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Describe the other items').nth(0).click();
      await expect(page.getByRole('textbox', { name: 'Describe the other items' })).toBeInViewport();
    });
  });

  test.describe('Travel abroad, travel documents, permission and travel information', () => {
    test('saves the answers, continues through the questions, and shows them again', async ({ page }) => {
      await reachItemsForChangeover(page);
      await page.getByLabel('Clothes and shoes').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await expect(page).toHaveURL(/travel-abroad/);
      await expect(page.locator('h1')).toContainText(
        'How much notice should be given before travelling abroad with the children?',
      );
      await page.getByLabel('Another arrangement').check();
      await page.getByRole('textbox', { name: 'Describe the arrangement' }).fill('At least 12 weeks');
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await expect(page).toHaveURL(/travel-documents/);
      await expect(page.locator('h1')).toContainText(
        'Who will arrange passports, visas and other travel documents for the children?',
      );
      await page.getByRole('radio', { name: 'The parent travelling with the children' }).check();
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await expect(page).toHaveURL(/consent-to-travel/);
      await expect(page.locator('h1')).toContainText('Permission for taking the children abroad');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      await expect(page).toHaveURL(/travel-information/);
      await expect(page.locator('h1')).toContainText(
        'What other information should be shared before travelling abroad with the children?',
      );
      await page.getByLabel('Accommodation address').check();
      await page.getByLabel('Other', { exact: true }).check();
      await page.getByRole('textbox', { name: 'Describe the other information' }).fill('Flight numbers');
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await expect(page).toHaveURL(/\/make-a-plan/);
      await expect(page.locator('#handoverAndHolidays-taskList-5-status')).toHaveText(/Completed/i);
      await expect(page.locator('#handoverAndHolidays-taskList-6-status')).toHaveText(/Completed/i);
      await expect(page.locator('#handoverAndHolidays-taskList-8-status')).toHaveText(/Completed/i);

      await page.getByRole('link', { name: /how much notice should be given before travelling abroad/i }).click();
      await expect(page.getByLabel('Another arrangement')).toBeChecked();
      await expect(page.getByRole('textbox', { name: 'Describe the arrangement' })).toHaveValue('At least 12 weeks');
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(page.getByRole('radio', { name: 'The parent travelling with the children' })).toBeChecked();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await expect(page.getByLabel('Accommodation address')).toBeChecked();
      await expect(page.getByLabel('Other', { exact: true })).toBeChecked();
      await expect(page.getByRole('textbox', { name: 'Describe the other information' })).toHaveValue('Flight numbers');
    });

    test('shows an error when travel abroad is left blank or another arrangement is not described', async ({
      page,
    }) => {
      await reachItemsForChangeover(page);
      await page.getByLabel('Clothes and shoes').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(
        page.getByText('Select how much notice should be given before travelling abroad with the children').nth(0),
      ).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page
        .getByText('Select how much notice should be given before travelling abroad with the children')
        .nth(0)
        .click();
      await expect(
        page.getByRole('heading', {
          name: 'How much notice should be given before travelling abroad with the children?',
        }),
      ).toBeInViewport();

      await page.getByLabel('Another arrangement').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(page.getByText('Describe the arrangement you are proposing').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Describe the arrangement you are proposing').nth(0).click();
      await expect(page.getByRole('textbox', { name: 'Describe the arrangement' })).toBeInViewport();
    });

    test('shows an error when travel documents are left blank or another arrangement is not described', async ({
      page,
    }) => {
      await reachItemsForChangeover(page);
      await page.getByLabel('Clothes and shoes').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await page.getByLabel('At least 2 weeks').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(
        page.getByText('Select who will arrange passports, visas and other travel documents').nth(0),
      ).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Select who will arrange passports, visas and other travel documents').nth(0).click();
      await expect(
        page.getByRole('heading', {
          name: 'Who will arrange passports, visas and other travel documents for the children?',
        }),
      ).toBeInViewport();

      await page.getByLabel('Another arrangement').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(page.getByText('Describe the arrangement you are proposing').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Describe the arrangement you are proposing').nth(0).click();
      await expect(page.getByRole('textbox', { name: 'Describe the arrangement' })).toBeInViewport();
    });

    test('shows an error when travel information is left blank or other information is not described', async ({
      page,
    }) => {
      await reachItemsForChangeover(page);
      await page.getByLabel('Clothes and shoes').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await page.getByLabel('At least 2 weeks').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await page.getByRole('radio', { name: 'You', exact: true }).check();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(
        page
          .getByText('Select what other information should be shared before travelling abroad with the children')
          .nth(0),
      ).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page
        .getByText('Select what other information should be shared before travelling abroad with the children')
        .nth(0)
        .click();
      await expect(
        page.getByRole('heading', {
          name: 'What other information should be shared before travelling abroad with the children?',
        }),
      ).toBeInViewport();

      await page.getByLabel('Other', { exact: true }).check();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await expect(page.getByText('Describe the other information').nth(0)).toBeVisible();
      await expectErrorSummaryVisible(page);
      await page.getByText('Describe the other information').nth(0).click();
      await expect(page.getByRole('textbox', { name: 'Describe the other information' })).toBeInViewport();
    });
  });
});

async function reachItemsForChangeover(page: Page) {
  await page.getByRole('link', { name: /how will .* get between households/i }).click();
  await page.getByLabel(/Parent collects Test/).check();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByLabel(/Neutral location/).check();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('radio', { name: 'No', exact: true }).check();
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page).toHaveURL(/items-for-changeover/);
}
