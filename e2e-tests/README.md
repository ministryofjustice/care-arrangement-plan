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

### Core Journey Tests

- `health.spec.ts` - API health check tests
- `homepage.spec.ts` - Homepage functionality tests
- `journey-flow.spec.ts` - User journey and flow tests
- `complete-journey.spec.ts` - Full end-to-end journey tests
- `task-list.spec.ts` - Task list functionality tests
- `session-persistence.spec.ts` - Session management tests
- `static-pages.spec.ts` - Static pages (cookies, privacy, etc.)

### Feature Tests

- **`check-your-answers.spec.ts`** - Comprehensive tests for the Check Your Answers summary page

  - Validates all sections display correct data
  - Tests change links functionality
  - Verifies data updates after changes
  - Tests with single and multiple children scenarios
  - Validates data formatting and ordering

- **`pdf-download.spec.ts`** - Tests for PDF download functionality
  - Validates PDF download triggers correctly
  - Verifies filename is appropriate
  - Checks PDF contains all entered information
  - Tests GOV.UK branding inclusion
  - Tests with 1 child and multiple children scenarios

### Accessibility Tests

- `accessibility.spec.ts` - Basic accessibility compliance tests
- **`accessibility-axe.spec.ts`** - Comprehensive accessibility tests using axe-core
  - Automated WCAG 2.0 Level A/AA compliance testing
  - Tests for proper form labels and ARIA attributes
  - Validates error message accessibility
  - Tests heading hierarchy and landmarks
  - Color contrast validation
  - Documents manual screen reader testing scenarios

### Examples

- `page-object-example.spec.ts` - Examples using Page Objects

## Fixtures

### Page Objects (`fixtures/page-objects.ts`)

Reusable page object models for common pages:

- `PasswordPage`
- `SafetyCheckPage`
- `TaskListPage`
- `AboutTheChildrenPage`

### Test Helpers (`fixtures/test-helpers.ts`)

Utility functions for common test operations:

- `startJourney()` - Start from homepage
- `completeSafetyChecks()` - Complete safety check pages
- `completeOnboardingFlow()` - Complete full onboarding
- `navigateToTaskList()` - Navigate to task list with minimal data
- `fillChildDetails()` - Fill child details on forms
- `fillAdultDetails()` - Fill adult details on forms
- `generateTestChildData()` - Generate test data for children

**New Journey Completion Helpers:**

- `completeMinimalJourney()` - Complete minimum required for all sections to reach Check Your Answers
- `completeLivingAndVisitingSection()` - Complete Living and Visiting section
- `completeHandoverAndHolidaysSection()` - Complete Handover and Holidays section
- `completeSpecialDaysSection()` - Complete Special Days section
- `completeOtherThingsSection()` - Complete Other Things section
- `completeDecisionMakingSection()` - Complete Decision Making section

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
4. Leverage helper functions (especially `completeMinimalJourney()` for tests that need a complete journey)
5. Keep tests independent
6. Use role-based selectors when possible (`getByRole`, `getByLabel`, `getByText`)
7. Avoid hard waits

## CI/CD Integration

Tests run automatically in the CI/CD pipeline:

1. **Pull Request Validation** - Runs on every PR to main (local server)
2. **Development Environment** - Runs after deployment to dev
3. **Staging Environment** - Runs after deployment to staging
4. **Production Environment** - Runs after deployment to production

The `playwright-e2e.yml` workflow is called by the release pipeline for each environment with the appropriate `base_url`.

## Accessibility Testing

### Automated Testing

The test suite uses `@axe-core/playwright` to perform automated accessibility scanning against WCAG 2.0 Level A and AA standards.

### Manual Testing Requirements

Some accessibility features require manual testing with screen readers (NVDA, JAWS, VoiceOver). See `accessibility-axe.spec.ts` for documented manual test scenarios.

## PDF Testing

PDF download tests verify the download functionality and basic content. They check:

- Download triggers successfully
- Appropriate filename (not "download.pdf")
- PDF contains entered data
- GOV.UK branding is present
- Works with single and multiple children

## Troubleshooting

### Tests fail locally

- Run `npx playwright install` to ensure browsers are up to date
- Check your Node.js version matches `.nvmrc`
- Verify `.env.test` is configured correctly

### Accessibility tests failing

- Check the Playwright HTML report: `npx playwright show-report`
- Violations include selectors to identify problematic elements

### PDF tests failing

- Ensure `playwright-downloads` directory has write permissions
- Verify PDF generation works: `node scripts/generatePdf.js`
