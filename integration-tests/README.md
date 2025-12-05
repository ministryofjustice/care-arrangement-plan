# E2E Testing with Cypress

This directory contains comprehensive end-to-end (E2E) tests for the Care Arrangement Plan application using Cypress.

## Overview

The E2E test suite validates all links, buttons, and critical user journeys across every page in the application. Tests run automatically before each deployment stage (development, staging, and production) to ensure the application works correctly in each environment.

## Test Structure

Tests are organised by functional areas:

- **authentication-pages.cy.ts** - Password page, cookies, privacy, terms, accessibility
- **start-and-safety-checks.cy.ts** - Start page and safety check pages
- **initial-questions.cy.ts** - Court order checks, number of children, about children/adults
- **living-and-visiting.cy.ts** - Living arrangements and visiting schedules
- **handover-and-holidays.cy.ts** - Handover locations and holiday arrangements
- **special-days-and-other-things.cy.ts** - Special days and other considerations
- **decision-making.cy.ts** - Last minute changes, long-term notice, plan reviews
- **task-list-and-summary.cy.ts** - Task list, check answers, share plan, confirmation
- **downloads.cy.ts** - PDF and HTML download endpoints
- **health.cy.ts** - Health check endpoint

## Running Tests

### Local Development

Run tests against local development server:
```bash
npm run int-test:ci
```

This will build the application, start the server, and run all E2E tests.

To open Cypress in interactive mode:
```bash
npm run int-test-ui
```

### Environment-Specific Tests

Run tests against deployed environments:

```bash
# Development environment
npm run int-test:dev

# Staging environment
npm run int-test:staging

# Production environment
npm run int-test:prod
```

## CI/CD Integration

The E2E tests are integrated into the deployment pipeline and run automatically:

1. **After Development Deployment** - Tests run against the dev environment
2. **After Staging Deployment** - Tests run against the staging environment
3. **After Production Deployment** - Tests run against the production environment

If any E2E tests fail, the deployment pipeline will stop and prevent deployment to the next environment.

## Custom Commands

Custom Cypress commands are available in `support/commands.ts`:

- `cy.visitWithSession(url)` - Visit a page with authenticated session
- `cy.checkAllLinks()` - Verify all links on the page are visible
- `cy.checkButton(buttonText)` - Check if a button exists and is visible
- `cy.checkLink(linkText, shouldExist)` - Check if a link exists

## Configuration

Cypress configuration is defined in `cypress.config.ts` at the root level:

- Base URL: `http://localhost:8001` (overridable via command line)
- Test files: `integration-tests/e2e/**/*.cy.{js,jsx,ts,tsx}`
- Support file: `integration-tests/support/e2e.ts`
- Fixtures: `integration-tests/fixtures`
- Screenshots: `integration-tests/screenshots`
- Videos: `integration-tests/videos`

## Environment Variables

- `CYPRESS_BETA_ACCESS_PASSWORD` - Password for beta access authentication
  - Local tests: Defaults to `parent-planner` (from `.env.test`)
  - CI/CD: Set as GitHub secret for environment-specific tests
  - The password must match one from the `BETA_ACCESS_PASSWORDS` list in the environment

## Test Coverage

The test suite covers:

- All static pages (cookies, privacy, terms, accessibility, contact us)
- Password/authentication flow
- Safety checks (adult and children)
- All form pages in the care plan journey
- Task list and progress tracking
- Check your answers and summary pages
- Download endpoints (PDF, HTML)
- All "not required" redirect pages
- Link and button visibility on all pages

## Maintenance

When adding new pages or features:

1. Add new test files in `integration-tests/e2e/` following the naming convention `*.cy.ts`
2. Use the custom commands for consistent testing patterns
3. Ensure all links and buttons are tested
4. Test both success and error states where applicable

## Troubleshooting

### Test Failures

If tests fail:

1. Check the Cypress screenshots in `integration-tests/screenshots/`
2. Review the test output for specific error messages
3. Verify the application is running and accessible at the configured base URL
4. Ensure `CYPRESS_BETA_ACCESS_PASSWORD` is set correctly for environment tests
5. Check that all required pages and routes are deployed in the target environment

### Cypress Cache Issues

If you encounter errors like `EEXIST: file already exists` when opening Cypress UI:

```bash
# Clear Cypress cache
npx cypress cache clear

# Reinstall Cypress
npm install cypress --force

# Verify Cypress installation
npx cypress verify

# Try opening UI again
npm run int-test-ui
```

### Session/Authentication Issues

If tests fail due to authentication:

1. Ensure `.env.test` has the correct `BETA_ACCESS_PASSWORD` value
2. For environment tests, verify the `CYPRESS_BETA_ACCESS_PASSWORD` environment variable is set
3. Clear browser data if tests are stuck on password page
