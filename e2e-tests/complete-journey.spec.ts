import { test, expect } from '@playwright/test';

test.describe('Complete-journey', () => {
  test('should complete full journey from start to end', async ({ page }) => {

    // Start Page
    await page.goto('/');
    await page.getByRole('button', { name: /start now/i }).click();

    // Safety-check
    await expect(page).toHaveURL(/safety-check/);
    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Not-safe
    await expect(page).toHaveURL(/not-safe/);
    await page.getByRole('button', { name: /continue/i }).click();

    // Children-safety-check
    await expect(page).toHaveURL(/children-safety-check/);
    await page.getByLabel(/no/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Children-not-safe
    await expect(page).toHaveURL(/children-not-safe/);
    await page.getByRole('button', { name: /continue/i }).click();

    // Do-whats-best
    await expect(page).toHaveURL(/do-whats-best/);
    await page.getByRole('checkbox', { name: /I will put my children.s needs first/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Court order check
    await expect(page).toHaveURL(/court-order-check/);
    await page.getByLabel(/no/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // number of children
    await expect(page).toHaveURL(/number-of-children/);
    await page.getByLabel(/How many children is this for/i).fill('1');
    await page.getByRole('button', { name: /continue/i }).click();

    // about the children
    await expect(page).toHaveURL(/about-the-children/);
    await page.getByLabel(/first name of the child/i).fill('test');
    await page.getByRole('button', { name: /continue/i }).click();

    // about the adults
    await expect(page).toHaveURL(/about-the-adults/);
    await page.fill('input[name="initial-adult-name"]', 'Parent');
    await page.fill('input[name="secondary-adult-name"]', 'Guardian');
    await page.getByRole('button', { name: /continue/i }).click();

    // Make a plan
    await expect(page).toHaveURL(/make-a-plan/);
    await page.getByRole('link', { name: /where will the children spend most of their time/i }).click();

    // Living and visiting
    await expect(page).toHaveURL(/where-will-the-children-mostly-live/);
    await page.getByLabel(/With Parent/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Living and visiting
    await expect(page).toHaveURL(/will-overnights-happen/);
    await page.getByLabel(/Yes/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Living and visiting
    await expect(page).toHaveURL(/which-days-overnight/);
    await page.getByLabel(/Another arrangement/i).check();
    await page.getByLabel('Describe the arrangement').fill('Test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Living and visiting
    await expect(page).toHaveURL(/will-daytime-visits-happen/);
    await page.getByLabel(/Yes/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Living and visiting
    await expect(page).toHaveURL(/which-days-daytime-visits/);
    await page.getByLabel(/Another arrangement/i).check();
    await page.getByLabel('Describe the arrangement').fill('Test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Make a plan continued
    await expect(page).toHaveURL(/make-a-plan/);
    await page.getByRole('link', { name: /How will the children get between households/i }).click();

    // Handovers and holidays
    await expect(page).toHaveURL(/get-between-households/);
    await page.getByLabel(/Parent collects the children/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Handovers and holidays
    await expect(page).toHaveURL(/where-handover/);
    await page.getByLabel(/Neutral location/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Handovers and holidays
    await expect(page).toHaveURL(/will-change-during-school-holidays/);
    await page.getByLabel(/Yes/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Handovers and holidays
    await expect(page).toHaveURL(/how-change-during-school-holidays/);
    await page.fill('textarea', 'test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Handovers and holidays
    await expect(page).toHaveURL(/items-for-changeover/);
    await page.fill('textarea', 'test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Make a plan, next section
    await expect(page).toHaveURL(/make-a-plan/);
    await page.getByRole('link', { name: /What will happen on special days/i }).click();

    // Special days
    await expect(page).toHaveURL(/what-will-happen/);
    await page.fill('textarea', 'test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Make a plan, next section
    await expect(page).toHaveURL(/make-a-plan/);
    await page.getByRole('link', { name: /What other things matter to your children/i }).click();

    // Other things
    await expect(page).toHaveURL(/what-other-things-matter/);
    await page.fill('textarea', 'test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Make a plan, next section
    await expect(page).toHaveURL(/make-a-plan/);
    await page.getByRole('link', { name: /How should last-minute changes be communicated/i }).click();

    // Decision making
    await expect(page).toHaveURL(/plan-last-minute-changes/);
    await page.getByLabel(/By Text Message/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Decision making
    await expect(page).toHaveURL(/plan-long-term-notice/);
    await page.getByLabel(/2 weeks/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // plan-review
    await expect(page).toHaveURL(/plan-review/);
    await page.fill('input[name="plan-review-months"]', '2');
    await page.getByRole('button', { name: /continue/i }).click();

    // Make a plan, next section
    await expect(page).toHaveURL(/make-a-plan/);
    await page.getByRole('button', { name: /continue/i }).click();

    // check-your-answers
    await expect(page).toHaveURL(/check-your-answers/);
    await page.getByRole('button', { name: /continue/i }).click();

    // share-plan
    await expect(page).toHaveURL(/share-plan/);
    await page.getByRole('button', { name: /Download plan as PDF/i }).click();   
    
    // Confirmation
    await expect(page).toHaveURL(/confirmation/);
  });
});
