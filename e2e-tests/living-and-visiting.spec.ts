import { test, expect, Page } from '@playwright/test';
 
import { navigateToTaskList, fillLivingAndVisitingSectionAndContinue} from './fixtures/test-helpers';

//Form Persistence Check
async function isOptionCheckedContinue(page: Page, choiceLabels: string[], textArea: boolean = false, textAreaValue: string = '') {
  for (const label of choiceLabels) {
      await expect(page.getByLabel(label)).toBeChecked();
  }
  if (textArea) {
     await expect(page.locator('textarea:visible')).toHaveValue(textAreaValue);
  }
  await page.getByRole('button', { name: /continue/i }).click();
}
 
test.describe('Mostly Lives Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTaskList(page);
    await expect(page).toHaveURL(/\/make-a-plan/);
    await page.getByRole('link', { name: /where will the children mostly live/i }).click();
    // navigateToTaskList causes Adult 1 to be named Parent and Adult 2 to be Guardian, so they are mentioned throughout the test.
  });
 
  test.describe('Child mostly lives with Adult 1 and visits/stays with Adult 2', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await fillLivingAndVisitingSectionAndContinue(page, /where-will-the-children-mostly-live/, 'Where will the children mostly live?', ['With Parent'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-overnights-happen/, 'Will the children stay overnight with Guardian?', ['Yes'])
      await fillLivingAndVisitingSectionAndContinue(page, /which-days-overnight/, 'On which days will overnights happen?', ['Tuesday', 'Wednesday'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-daytime-visits-happen/, 'Will the children do daytime visits with Guardian?', ['Yes'])
      await fillLivingAndVisitingSectionAndContinue(page, /which-days-daytime-visits/, 'On which days will daytime visits happen?', ['Monday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      await expect(page).toHaveURL(/\/make-a-plan/);
      const completedStatus = page.locator('#livingAndVisiting-taskList-1-status');
      await expect(completedStatus).toHaveText(/Completed/i);

      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await isOptionCheckedContinue(page, ['With Parent'])
      await isOptionCheckedContinue(page, ['Yes'])
      await isOptionCheckedContinue(page, ['Tuesday', 'Wednesday'])
      await isOptionCheckedContinue(page, ['Yes'])
      await isOptionCheckedContinue(page, ['Monday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    });
  });
 
   test.describe('Child mostly lives with Adult 1 and has other arrangements with Adult 2', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await fillLivingAndVisitingSectionAndContinue(page, /where-will-the-children-mostly-live/, 'Where will the children mostly live?', ['With Parent'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-overnights-happen/, 'Will the children stay overnight with Guardian?', ['Yes'])
      await fillLivingAndVisitingSectionAndContinue(page, /which-days-overnight/, 'On which days will overnights happen?', ['Another arrangement'])
      await page.getByLabel('Describe the arrangement').fill('The children will stay overnight with the mother of Parent during the week, and with Guardian on weekends.');
      await page.getByRole('button', { name: /continue/i }).click();
      await fillLivingAndVisitingSectionAndContinue(page, /will-daytime-visits-happen/, 'Will the children do daytime visits with Guardian?', ['Yes'])
      await fillLivingAndVisitingSectionAndContinue(page, /which-days-daytime-visits/, 'On which days will daytime visits happen?', ['Another arrangement'])
      await page.getByLabel('Describe the arrangement').fill('Guardian can only do daytime visits on weekends where Parent is away');
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await expect(page.locator('#livingAndVisiting-taskList-1-status')).toHaveText(/Completed/i)

      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await isOptionCheckedContinue(page, ['With Parent'])
      await isOptionCheckedContinue(page, ['Yes'])
      await isOptionCheckedContinue(page, ['Another arrangement'], true, 'The children will stay overnight with the mother of Parent during the week, and with Guardian on weekends.')
      await isOptionCheckedContinue(page, ['Yes'])
      await isOptionCheckedContinue(page, ['Another arrangement'], true, 'Guardian can only do daytime visits on weekends where Parent is away')
    });
  });
 
  test.describe('Child mostly lives with Adult 1 and does not visit or stay with Adult 2', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await fillLivingAndVisitingSectionAndContinue(page, /where-will-the-children-mostly-live/, 'Where will the children mostly live?', ['With Parent'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-overnights-happen/, 'Will the children stay overnight with Guardian?', ['No'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-daytime-visits-happen/, 'Will the children do daytime visits with Guardian?', ['No'])
      await expect(page).toHaveURL(/\/make-a-plan/);
      await expect(page.locator('#livingAndVisiting-taskList-1-status')).toHaveText(/Completed/i)

      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await isOptionCheckedContinue(page, ['With Parent'])
      await isOptionCheckedContinue(page, ['No'])
      await isOptionCheckedContinue(page, ['No'])
    });
  });

  test.describe('Child mostly lives with Adult 2 and visits/stays with Adult 1', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await fillLivingAndVisitingSectionAndContinue(page, /where-will-the-children-mostly-live/, 'Where will the children mostly live?', ['With Guardian'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-overnights-happen/, 'Will the children stay overnight with Parent?', ['Yes'])
      await fillLivingAndVisitingSectionAndContinue(page, /which-days-overnight/, 'On which days will overnights happen?', ['Monday', 'Tuesday', 'Wednesday'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-daytime-visits-happen/, 'Will the children do daytime visits with Parent?', ['Yes'])
      await fillLivingAndVisitingSectionAndContinue(page, /which-days-daytime-visits/, 'On which days will daytime visits happen?', ['Thursday', 'Friday', 'Saturday', 'Sunday'])
      await expect(page).toHaveURL(/\/make-a-plan/);
      const completedStatus = page.locator('#livingAndVisiting-taskList-1-status');
      await expect(completedStatus).toHaveText(/Completed/i);

      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await isOptionCheckedContinue(page, ['With Guardian'])
      await isOptionCheckedContinue(page, ['Yes'])
      await isOptionCheckedContinue(page, ['Monday', 'Tuesday', 'Wednesday'])
      await isOptionCheckedContinue(page, ['Yes'])
      await isOptionCheckedContinue(page, ['Thursday', 'Friday', 'Saturday', 'Sunday'])
    });
  });
 
   test.describe('Child mostly lives with Adult 2 and has other arrangements with Adult 1', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await fillLivingAndVisitingSectionAndContinue(page, /where-will-the-children-mostly-live/, 'Where will the children mostly live?', ['With Guardian'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-overnights-happen/, 'Will the children stay overnight with Parent?', ['Yes'])
      await fillLivingAndVisitingSectionAndContinue(page, /which-days-overnight/, 'On which days will overnights happen?', ['Another arrangement'])
      await page.getByLabel('Describe the arrangement').fill('The children will stay overnight with the mother of Guardian during the week, and with Parent on weekends.');
      await page.getByRole('button', { name: /continue/i }).click();
      await fillLivingAndVisitingSectionAndContinue(page, /will-daytime-visits-happen/, 'Will the children do daytime visits with Parent?', ['Yes'])
      await fillLivingAndVisitingSectionAndContinue(page, /which-days-daytime-visits/, 'On which days will daytime visits happen?', ['Another arrangement'])
      await page.getByLabel('Describe the arrangement').fill('Parent can only do daytime visits on weekends where Guardian is away');
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await expect(page.locator('#livingAndVisiting-taskList-1-status')).toHaveText(/Completed/i)

      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await isOptionCheckedContinue(page, ['With Guardian'])
      await isOptionCheckedContinue(page, ['Yes'])
      await isOptionCheckedContinue(page, ['Another arrangement'], true, 'The children will stay overnight with the mother of Guardian during the week, and with Parent on weekends.')
      await isOptionCheckedContinue(page, ['Yes'])
      await isOptionCheckedContinue(page, ['Another arrangement'], true, 'Parent can only do daytime visits on weekends where Guardian is away')
    });
  });
 
  test.describe('Child mostly lives with Adult 2 and does not visit or stay with Adult 1', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await fillLivingAndVisitingSectionAndContinue(page, /where-will-the-children-mostly-live/, 'Where will the children mostly live?', ['With Guardian'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-overnights-happen/, 'Will the children stay overnight with Parent?', ['No'])
      await fillLivingAndVisitingSectionAndContinue(page, /will-daytime-visits-happen/, 'Will the children do daytime visits with Parent?', ['No'])
      await expect(page).toHaveURL(/\/make-a-plan/);
      await expect(page.locator('#livingAndVisiting-taskList-1-status')).toHaveText(/Completed/i)

      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await isOptionCheckedContinue(page, ['With Guardian'])
      await isOptionCheckedContinue(page, ['No'])
      await isOptionCheckedContinue(page, ['No'])
    });
  });

  test.describe('Child splits time between living with Adult 1 and Adult 2', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await fillLivingAndVisitingSectionAndContinue(page, /where-will-the-children-mostly-live/, 'Where will the children mostly live?', ['They will split time between Parent and Guardian'])
      await expect(page).toHaveURL(/which-schedule-is-best/);
      await expect(page.locator('h1')).toContainText("Which schedule best meets the children's needs?");
      await page.waitForSelector('textarea.govuk-textarea', { state: 'attached' }); await page.locator('textarea.govuk-textarea').fill( 'Alternating weeks, The children will spend one week in one household and the next week in the other.' );
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await expect(page.locator('#livingAndVisiting-taskList-1-status')).toHaveText(/Completed/i)

      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await isOptionCheckedContinue(page, ['They will split time between Parent and Guardian'])
      await page.waitForSelector('textarea.govuk-textarea', { state: 'attached' }); 
      await expect(page.locator('textarea.govuk-textarea')).toHaveValue( 'Alternating weeks, The children will spend one week in one household and the next week in the other.' );
    });
  });

  test.describe('Another Arrangement is made for the child', () => {
    test('Fill fields unitll section is complete', async ({ page }) => {
      await page.getByLabel(/Another arrangement/i).check();  
      await page.getByLabel('Describe the arrangement').fill('The children will live in foster care, with occasional visits by parents');
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/make-a-plan/);
      await expect(page.locator('#livingAndVisiting-taskList-1-status')).toHaveText(/Completed/i)

      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await isOptionCheckedContinue(page, ['Another Arrangement'], true, 'The children will live in foster care, with occasional visits by parents')
    });
  });
});
 