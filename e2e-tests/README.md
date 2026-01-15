# E2E Tests

End-to-end tests for the Care Arrangement Plan application using Playwright.

## Quick Start

```bash
# Run all tests
npm run e2e

# Run tests with UI (recommended for development)
npm run e2e:ui

# Run tests in headed mode
npm run e2e:headed

# Debug a specific test
npm run e2e:debug
```

## Test Files

- `health.spec.ts` - API health check tests
- `homepage.spec.ts` - Homepage functionality tests
- `journey-flow.spec.ts` - User journey and flow tests
- `accessibility.spec.ts` - Accessibility compliance tests
- `static-pages.spec.ts` - Static pages (cookies, privacy, etc.)
- `session-persistence.spec.ts` - Session management tests
- `task-list.spec.ts` - Task list functionality tests
- `page-object-example.spec.ts` - Examples using Page Objects
- `complete-journey.spec.ts` - Full end-to-end journey tests

## Fixtures

### Page Objects (`fixtures/page-objects.ts`)

Reusable page object models for common pages:
- `PasswordPage`
- `SafetyCheckPage`
- `TaskListPage`
- `AboutTheChildrenPage`

### Test Helpers (`fixtures/test-helpers.ts`)

Utility functions for common test operations:
- `completePasswordFlow()`
- `completeSafetyChecks()`
- `navigateToTaskList()`
- `fillChildDetails()`
- `generateTestChildData()`

## Writing Tests

### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Using Page Objects

```typescript
import { PasswordPage } from './fixtures/page-objects';

test('login', async ({ page }) => {
  const passwordPage = new PasswordPage(page);
  await passwordPage.goto();
  await passwordPage.submitWithPassword('parent-planner');
});
```

### Using Helpers

```typescript
import { navigateToTaskList } from './fixtures/test-helpers';

test('task list test', async ({ page }) => {
  await navigateToTaskList(page);
  // Test continues from task list
});
```

## Best Practices

1. Use descriptive test names
2. Follow Arrange-Act-Assert pattern
3. Use Page Objects for repeated interactions
4. Leverage helper functions
5. Keep tests independent
6. Use role-based selectors when possible
7. Avoid hard waits
