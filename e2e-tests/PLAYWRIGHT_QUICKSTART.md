# Playwright Quick Start Guide

A 5-minute guide to get started with Playwright testing.

## Prerequisites

Playwright is already installed. If browsers aren't installed yet:

```bash
npx playwright install --with-deps chromium
```

## Run Your First Test

```bash
# Run all tests (headless)
npm run e2e

# Run with UI (recommended for first time)
npm run e2e:ui
```

## Available Commands

```bash
npm run e2e          # Run all tests (headless)
npm run e2e:ui       # Interactive UI mode
npm run e2e:headed   # Watch browser execution
npm run e2e:debug    # Debug mode with breakpoints
```

## Writing Your First Test

Create a file `e2e-tests/my-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('my first test', async ({ page }) => {
  // Go to a page
  await page.goto('/');

  // Assert something
  await expect(page.locator('h1')).toBeVisible();
});
```

Run it:
```bash
npx playwright test my-test.spec.ts
```

## Common Patterns

### Click a Button
```typescript
await page.getByRole('button', { name: /continue/i }).click();
```

### Fill a Form
```typescript
await page.getByLabel(/password/i).fill('parent-planner');
await page.getByRole('button', { name: /submit/i }).click();
```

### Check for Text
```typescript
await expect(page.locator('h1')).toContainText('Welcome');
```

### Verify URL
```typescript
await expect(page).toHaveURL(/\/make-a-plan/);
```

### Check for Errors
```typescript
const errorSummary = page.locator('.govuk-error-summary');
await expect(errorSummary).toBeVisible();
```

## Using Helper Functions

Instead of repeating common flows:

```typescript
import { navigateToTaskList } from './fixtures/test-helpers';

test('task list test', async ({ page }) => {
  // This handles all the setup to get to the task list
  await navigateToTaskList(page);

  // Now test task list functionality
  await expect(page).toHaveURL(/\/make-a-plan/);
});
```

## Using Page Objects

For cleaner, reusable code:

```typescript
import { PasswordPage } from './fixtures/page-objects';

test('login test', async ({ page }) => {
  const passwordPage = new PasswordPage(page);
  await passwordPage.goto();
  await passwordPage.submitWithPassword('parent-planner');

  await expect(page).toHaveURL(/\/safety-check/);
});
```

## Debugging Tips

### Use UI Mode (Best for Development)
```bash
npm run e2e:ui
```
- Time-travel through test steps
- See screenshots at each step
- Edit and rerun tests instantly

### Use Headed Mode
```bash
npm run e2e:headed
```
Watch the browser as tests run.

### Add `page.pause()`
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Test pauses here - inspect in browser
  await page.click('button');
});
```

### Use `--debug` Flag
```bash
npx playwright test my-test.spec.ts --debug
```
Opens DevTools for debugging.

## Common Selectors

### GOV.UK Components

```typescript
// Error summary
page.locator('.govuk-error-summary')

// Error message
page.locator('.govuk-error-message')

// Back link
page.locator('.govuk-back-link')

// Button
page.getByRole('button', { name: /continue/i })

// Radio button
page.getByLabel(/yes/i)

// Form input
page.getByLabel(/password/i)
```

## Test Structure

```typescript
test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Arrange - Set up test data and state
    await page.goto('/password');

    // Act - Perform the action being tested
    await page.getByLabel(/password/i).fill('test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Assert - Verify the outcome
    await expect(page.locator('.govuk-error-summary')).toBeVisible();
  });
});
```

## Run Specific Tests

```bash
# Run one file
npx playwright test homepage.spec.ts

# Run tests matching a pattern
npx playwright test --grep "homepage"

# Run in specific browser
npx playwright test --project=chromium

# Run in headed mode for one test
npx playwright test homepage.spec.ts --headed
```

## View Test Reports

After running tests:

```bash
npx playwright show-report
```

Opens an HTML report with:
- Test results
- Screenshots on failure
- Execution traces
- Error details

