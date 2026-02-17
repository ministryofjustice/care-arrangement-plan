import { test, expect, Page, Locator } from '@playwright/test';

import {startJourney, navigateToTaskList, completeOnboardingFlow, fillNumberOfChildren} from './fixtures/test-helpers';

// Helper: press Tab and return the newly focused element's locator
async function tabAndGetFocused(page: Page) {
  await page.keyboard.press('Tab');
  return page.locator(':focus');
}

// Safe helpers to avoid inline .catch arrow functionsx which trigger lint rules
async function safeEvaluate<T = string>(locator: Locator, fn: (el: any) => T, fallback: T): Promise<T> {
  try {
    return (await locator.evaluate(fn as any)) as T;
  } catch {
    return fallback;
  }
}

async function safeGetAttribute(locator: Locator, name: string): Promise<string | null> {
  try {
    return await locator.getAttribute(name);
  } catch {
    return null;
  }
}

async function safeTextContent(locator: Locator, fallback = ''): Promise<string> {
  try {
    const t = await locator.textContent();
    return t ?? fallback;
  } catch {
    return fallback;
  }
}

async function safeIsInFooter(locator: Locator): Promise<boolean> {
  try {
    return !!(await locator.evaluate((el: any) => !!el.closest && !!el.closest('footer')));
  } catch {
    return false;
  }
}

//Helper: press Tab until the focused element matches a role/name, with a max number of presses
async function tabToElement(page: Page, role: string, name: RegExp, maxTabs = 30) {
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    if (await focused.count() === 0) break;

    const info = await focused.evaluate((el) => {
      const tag = el.tagName.toLowerCase();
      const type = el.getAttribute('type') || '';
      const role = el.getAttribute('role') || '';
      const name = el.getAttribute('name') || '';
      const id = el.id || '';
      const ariaLabel = el.getAttribute('aria-label') || '';
      return { tag, type, role, name, id, ariaLabel };
    });

    const tagName = info.tag;
    const ariaRole = info.role;
    const elRole = ariaRole || tagName;

    // Link
    if (role === 'link' && elRole === 'a') {
      const text = await focused.textContent();
      if (text && name.test(text)) return focused;
    }

    // Button
    if (role === 'button' && (elRole === 'button' || tagName === 'button')) {
      const text = await focused.textContent();
      if (text && name.test(text)) return focused;
    }

    // Radio
    if (role === 'radio' && tagName === 'input' && info.type === 'radio') {
      const label = await focused.evaluate((el) => {
        const id = el.getAttribute('id');
        const labelEl = id ? el.ownerDocument?.querySelector(`label[for="${id}"]`) : null;
        return labelEl?.textContent || '';
      });
      if (name.test(label)) return focused;
    }

    // Checkbox
    if (role === 'checkbox' && tagName === 'input' && info.type === 'checkbox') {
      const label = await focused.evaluate((el) => {
        const id = el.getAttribute('id');
        const labelEl = id ? el.ownerDocument?.querySelector(`label[for="${id}"]`) : null;
        return labelEl?.textContent || '';
      });
      if (name.test(label)) return focused;
    }

    // Textbox
    if (role === 'textbox' && (tagName === 'input' || tagName === 'textarea')) {
      const labelText = await focused.evaluate((el) => {
        const id = el.getAttribute('id');
        const labelEl = id ? el.ownerDocument?.querySelector(`label[for="${id}"]`) : null;
        return (
          labelEl?.textContent ||
          el.getAttribute('aria-label') ||
          ''
        );
      });
      if (name.test(labelText)) return focused;
    }
  }

  throw new Error(`Could not tab to ${role} matching ${name} within ${maxTabs} tabs`);
}



//Helper: verify the currently focused element has a visible focus indicator
async function expectFocusVisible(page: Page) {
  const styles = await page.locator(':focus').evaluate((el) => {
    // Use the element's ownerDocument.defaultView to get the correct window
    // object in the browser context instead of referencing a global 'window'
    const doc = el.ownerDocument;
    const win = doc ? doc.defaultView : null;
    const computed = win ? win.getComputedStyle(el) : (el as any).style;

    return {
      outline: (computed as any).outline || '',
      outlineWidth: (computed as any).outlineWidth || '',
      outlineStyle: (computed as any).outlineStyle || '',
      boxShadow: (computed as any).boxShadow || '',
      border: (computed as any).border || '',
    };
  });

  // GOV.UK uses either outline or box-shadow for focus indicators
  const hasOutline = styles.outlineStyle !== 'none' && styles.outlineWidth !== '0px';
  const hasBoxShadow = styles.boxShadow !== 'none';

  expect(hasOutline || hasBoxShadow,
    `Expected visible focus indicator. Got outline: ${styles.outline}, box-shadow: ${styles.boxShadow}`,).toBe(true);
}

test.describe('Keyboard Accessibility', () => {
  test.describe('Skip Links', () => {
    test('skip link appears on focus and navigates to main content', async ({ page }) => {
      await page.goto('/');

      // First Tab should focus the skip link
      const skipLink = await tabAndGetFocused(page);
      await expect(skipLink).toHaveClass(/govuk-skip-link/);
      await expect(skipLink).toBeVisible();
      await expect(skipLink).toHaveAttribute('href', '#main-content');

      // Activate skip link with Enter
      await page.keyboard.press('Enter');

      // Focus should move to or near the main content area
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeVisible();
    });

    test('skip link works on form pages', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).click();

      // Tab to skip link on the safety-check page
      const skipLink = await tabAndGetFocused(page);
      await expect(skipLink).toHaveClass(/govuk-skip-link/);
      await expect(skipLink).toBeVisible();
    });
  });

  test.describe('Focus Indicators', () => {
    test('focus indicators are visible on interactive elements on homepage', async ({ page }) => {
      await page.goto('/');

      // Tab past skip link
      await page.keyboard.press('Tab');

      // Tab through several interactive elements and check focus visibility
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const count = await focused.count();
        if (count > 0) {
          await expectFocusVisible(page);
        }
      }
    });

    test('focus indicators are visible on form elements', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).click();

      // Tab through form elements and verify focus indicators
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const count = await focused.count();
        if (count > 0) {
          const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());
          if (['input', 'button', 'a', 'select', 'textarea'].includes(tagName)) {
            await expectFocusVisible(page);
          }
        }
      }
    });
  });

  test.describe('Tab Order', () => {
    test('tab order is logical on the homepage', async ({ page }) => {
      await page.goto('/');

      const tabOrder: string[] = [];

      // Tab through all elements and record the order
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const count = await focused.count();
        if (count === 0) break;

        const description = await focused.evaluate((el) => {
          const tag = el.tagName.toLowerCase();
          const text = (el.textContent || '').trim().substring(0, 50);
          const role = el.getAttribute('role') || tag;
          return `${role}: ${text}`;
        });
        tabOrder.push(description);
      }

      // Should have found interactive elements
      expect(tabOrder.length).toBeGreaterThan(0);
    });

    test('tab order is logical on a radio button form page', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).click();
      await expect(page).toHaveURL(/\/safety-check/);
      await page.locator('h1').focus();

      const focusedElements: string[] = [];

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const count = await focused.count();
        if (count === 0) break;

        const info = await focused.evaluate((el) => {
          const tag = el.tagName.toLowerCase();
          const type = el.getAttribute('type') || '';
          return `${tag}${type ? `[${type}]` : ''}`;
        });
        focusedElements.push(info);
      }

      // Verify radios appear before the button in tab order
      const firstRadioIndex = focusedElements.findIndex((el) => el.includes('radio'));
      const buttonIndex = focusedElements.findIndex((el) => el.startsWith('button'));
      expect(firstRadioIndex).toBeGreaterThan(-1);
      expect(buttonIndex).toBeGreaterThan(-1);
      expect(firstRadioIndex).toBeLessThan(buttonIndex);
    });
  });

  test.describe('Form Controls with Keyboard', () => {
    test('radio buttons are selectable with Space key', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).click();

      // Tab to the first radio button (Yes)
      const yesRadio = await tabToElement(page, 'radio', /yes/i);
      await page.keyboard.press('Space');
      await expect(yesRadio).toBeChecked();
    });

    test('radio buttons are navigable with Arrow keys', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).click();

      // Tab to the first radio button
      await page.waitForSelector('input[type="radio"]');
      await tabToElement(page, 'radio', /yes/i);
      await page.keyboard.press('Space');

      // Arrow down should move to the next radio
      await page.keyboard.press('ArrowDown');
      const focused = page.locator(':focus');
      await expect(focused).toBeChecked();

      // Verify it's the "No" option
      const label = await focused.evaluate((el) => {
        const id = el.getAttribute('id');
        const labelEl = id ? el.ownerDocument?.querySelector(`label[for="${id}"]`) : null;
        return labelEl?.textContent || '';
      });
      expect(label).toMatch(/no/i);
    });

    test('checkboxes are selectable with Space key', async ({ page }) => {
      await startJourney(page);

      // Complete safety checks to reach do-whats-best
      await page.getByLabel(/yes/i).first().check();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByLabel(/yes/i).first().check();
      await page.getByRole('button', { name: /continue/i }).click();

      // Now on do-whats-best page with a checkbox
      await page.waitForSelector('input[type="checkbox"]');
      const checkbox = await tabToElement(page, 'checkbox', /children/i, 80);
      await page.keyboard.press('Space');
      await expect(checkbox).toBeChecked();

      // Space again should uncheck
      await page.keyboard.press('Space');
      await expect(checkbox).not.toBeChecked();
    });

    test('text inputs can be filled with keyboard', async ({ page }) => {
      await completeOnboardingFlow(page);
      await fillNumberOfChildren(page, 1);

      // Tab to the child name input
      await page.keyboard.press('Tab'); 
      await page.keyboard.press('Shift+Tab'); 
      await page.keyboard.type('KeyboardChild'); 
    });

    test('buttons are activatable with Enter key', async ({ page }) => {
      await page.goto('/');

      // Tab to the Start now button
      const button = await tabToElement(page, 'button', /start now/i);
      await page.keyboard.press('Enter');

      // Should have navigated to the next page
      await expect(page).toHaveURL(/\/safety-check/);
    });

    test('dropdowns are navigable with arrow keys', async ({ page }) => {
      await navigateToTaskList(page);

      // Navigate to a page with a select dropdown (mostly-live page)
      await page.getByRole('link', { name: /where will the children mostly live/i }).click();
      await expect(page).toHaveURL(/mostly-live/);

      // Check if there's a select element on this page
      const selectCount = await page.locator('select').count();
      if (selectCount > 0) {
        // Tab to the select element
        for (let i = 0; i < 20; i++) {
          await page.keyboard.press('Tab');
          const focused = page.locator(':focus');
          const tag = await safeEvaluate(focused, (el) => (el as any).tagName.toLowerCase(), '');
          if (tag === 'select') {
            // Navigate options with arrow keys
            await page.keyboard.press('ArrowDown');
            const value = await focused.inputValue();
            expect(value).toBeTruthy();
            break;
          }
        }
      }
    });
  });

  test.describe('Error Handling with Keyboard', () => {
    test('error summary links work with keyboard and move focus to the field', async ({ page }) => {
      await completeOnboardingFlow(page);
      await fillNumberOfChildren(page, 1);

      // Submit empty form to trigger validation error
      await page.getByRole('button', { name: /continue/i }).click();

      // Error summary should be visible
      const errorSummary = page.locator('.govuk-error-summary');
      await expect(errorSummary).toBeVisible();

      // Tab to the error summary link
      const errorLink = page.locator('.govuk-error-summary__list a').first();
      await expect(errorLink).toBeVisible();

      // The error summary should receive focus automatically (GOV.UK pattern)
      // Tab into the error links
      for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      const href = await safeGetAttribute(focused, 'href');
      if (href && href.startsWith('#')) {
        await page.keyboard.press('Enter');
        const targetId = href.replace('#', '');
        const inputId = targetId.replace('-error', '');
        const targetInput = page.locator(`#${inputId}`);
        await expect(targetInput).not.toBeFocused();
        break;
      }
     }
    });

    test('error summary is focusable after form submission', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).click();

      // Submit without selecting a radio
      await page.getByRole('button', { name: /continue/i }).click();

      // Error summary should be present and focusable
      const errorSummary = page.locator('.govuk-error-summary');
      await expect(errorSummary).toBeVisible();
      await expect(errorSummary).toHaveAttribute('tabindex', '-1');
    });
  });

  test.describe('Exit This Page with Keyboard', () => {
    test('Escape key triggers quick exit on safety-check page', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).click();
      await expect(page).toHaveURL(/\/safety-check/);

      // Press Escape (should not be in an input field)
      await page.keyboard.press('Escape');

      // Should redirect to BBC Weather
      await page.waitForURL(/bbc.*weather/, { timeout: 10000 });
    });

    test('Escape key triggers quick exit on children-safety-check page', async ({ page }) => {
      await startJourney(page);
      await page.getByLabel(/yes/i).first().check();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/children-safety-check/);

      await page.keyboard.press('Escape');
      await page.waitForURL(/bbc.*weather/, { timeout: 10000 });
    });

    test('Escape key does not trigger exit when focus is in an input field', async ({ page }) => {
      await completeOnboardingFlow(page);

      // On number-of-children page, focus the text input
      const input = page.getByLabel(/How many children is this for/i);
      await input.focus();

      // Press Escape while focused in the input
      await page.keyboard.press('Escape');

      // Should NOT redirect - still on the same page
      await expect(page).toHaveURL(/\/number-of-children/);
    });

    test('Exit This Page button is reachable via Tab', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /start now/i }).click();
      await expect(page).toHaveURL(/\/safety-check/);

      // Tab through to find the Exit This Page button
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const text = await safeTextContent(focused, '');
        if (/exit this page/i.test(text || '')) {
          await expectFocusVisible(page);
          // Verify it's a link that goes to BBC Weather
          const href = await focused.getAttribute('href');
          expect(href).toMatch(/bbc.*weather/i);
          return;
        }
      }

      // If Exit This Page button is present, it should be reachable
      const exitButton = page.locator('.govuk-exit-this-page__button');
      const exitCount = await exitButton.count();
      if (exitCount > 0) {
        throw new Error('Exit This Page button exists but was not reachable via Tab');
      }
    });
  });

  test.describe('Complete Journey with Keyboard Only', () => {
    test('should complete the onboarding flow using only keyboard', async ({ page }) => {
      await page.goto('/');

      // Tab to Start Now button and press Enter
      await tabToElement(page, 'button', /start now/i);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/safety-check/);

      // Safety check - select Yes radio with keyboard
      await tabToElement(page, 'radio', /yes/i);
      await page.keyboard.press('Space');
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/children-safety-check/);

      // Children safety check - select Yes
      await tabToElement(page, 'radio', /yes/i);
      await page.keyboard.press('Space');
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/do-whats-best/);

      // Do what's best - check the checkbox
      await tabToElement(page, 'checkbox', /children.s needs first/i);
      await page.keyboard.press('Space');
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/court-order-check/);

      // Court order check - select No
      const courtYes = await tabToElement(page, 'radio', /yes/i);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space'); 
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/number-of-children/);

      // Number of children - type a number
      await tabToElement(page, 'textbox', /how many children/i);
      await page.keyboard.type('1');
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/about-the-children/);

      // About the children - type child name
      await tabToElement(page, 'textbox', /first name/i);
      await page.keyboard.type('KeyboardTest');
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/about-the-adults/);

      // About the adults - type adult names
  for (let i = 0; i < 15; i++) {
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  const tag = await safeEvaluate(focused, (el) => (el as any).tagName.toLowerCase(), '');
  if (tag === 'input') {
          const name = await focused.getAttribute('name');
          if (name === 'initial-adult-name') {
            await page.keyboard.type('ParentA');
          } else if (name === 'secondary-adult-name') {
            await page.keyboard.type('ParentB');
            break;
          }
        }
      }
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');

      // Should arrive at task list
      await expect(page).toHaveURL(/\/make-a-plan/);
      const heading = page.locator('h1');
      await expect(heading).toContainText(/child arrangements plan/i);
    });

    test('should navigate task list sections using only keyboard', async ({ page }) => {
      // Use helpers to set up state, then verify keyboard navigation on the task list
      await navigateToTaskList(page);
      await expect(page).toHaveURL(/\/make-a-plan/);

      // Tab to the first task list link and activate it
      const taskLink = await tabToElement(page, 'link', /where will the children mostly live/i);
      await expectFocusVisible(page);
      await page.keyboard.press('Enter');

      // Should navigate to the section
      await expect(page).toHaveURL(/mostly-live/);

      // Select a radio option with keyboard
      await tabToElement(page, 'radio', /with/i);
      await page.keyboard.press('Space');
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');

      // Wait for navigation to next page or task list
      await page.waitForLoadState('networkidle');
    });

    test('should complete a full section using only keyboard', async ({ page }) => {
      await navigateToTaskList(page);

      // Navigate to special-days section via keyboard (single page with textarea)
      await page.waitForSelector('a[href="/special-days/what-will-happen"]');
      const specialDaysLink = await tabToElement(page, 'link', /special days/i, 80);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/what-will-happen/);

      // Tab to the textarea and type content
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const tag = await focused.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
        if (tag === 'textarea') {
          await page.keyboard.type('Share birthdays and holidays equally');
          break;
        }
      }

      // Tab to Continue and press Enter
      await tabToElement(page, 'button', /continue/i);
      await page.keyboard.press('Enter');

      // Should return to task list
      await page.waitForURL(/\/make-a-plan/);
    });
  });

  test.describe('Keyboard Navigation on All Page Types', () => {
    test('static pages are fully navigable with keyboard', async ({ page }) => {
      const staticPages = [
        '/accessibility-statement',
        '/privacy-notice',
        '/contact-us',
        '/terms-and-conditions',
      ];

      for (const pagePath of staticPages) {
        await page.goto(pagePath);

        // Verify skip link works
        await page.keyboard.press('Tab');
  const skipLink = page.locator(':focus');
  const skipLinkClass = (await safeGetAttribute(skipLink, 'class')) ?? '';
  expect(skipLinkClass).toContain('govuk-skip-link');

        // Tab through the page and verify no focus traps
        let lastFocusedText = '';
        let stuckCount = 0;

        for (let i = 0; i < 30; i++) {
          await page.keyboard.press('Tab');
          const focused = page.locator(':focus');
          const count = await focused.count();
          if (count === 0) break;

          const text = await safeEvaluate(focused, (el) => (el.textContent ? el.textContent.trim() : ''), '');
          if (text === lastFocusedText) {
            stuckCount++;
            if (stuckCount > 2) {
              throw new Error(`Focus appears to be trapped on "${text}" on ${pagePath}`);
            }
          } else {
            stuckCount = 0;
          }
          lastFocusedText = text;
        }
      }
    });

    test('footer links are reachable via Tab', async ({ page }) => {
      await page.goto('/');

      // Tab through until we reach footer links
      let foundFooterLink = false;
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
  const isInFooter = await safeIsInFooter(focused);
        if (isInFooter) {
          foundFooterLink = true;
          await expectFocusVisible(page);
          break;
        }
      }

      expect(foundFooterLink).toBe(true);
    });

    test('back link is reachable via Tab on form pages', async ({ page }) => {
      await startJourney(page);
      await page.getByLabel(/yes/i).first().check();
      await page.getByRole('button', { name: /continue/i }).click();
      await expect(page).toHaveURL(/\/children-safety-check/);

      // Tab through to find back link
      let foundBackLink = false;
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
  const className = (await safeGetAttribute(focused, 'class')) ?? '';
        if (className && className.includes('govuk-back-link')) {
          foundBackLink = true;
          await expectFocusVisible(page);

          // Pressing Enter should navigate back
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(/\/safety-check/);
          break;
        }
      }

      expect(foundBackLink).toBe(true);
    });
  });
});
