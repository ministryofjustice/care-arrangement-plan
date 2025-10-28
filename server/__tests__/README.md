# Tests Directory

This directory contains organised unit tests for the Care Arrangement Plan server code.

## Structure

```
server/__tests__/
├── html/           # HTML document generation tests
│   ├── createHtmlContent.test.ts
│   ├── addLivingAndVisiting.test.ts
│   ├── addHandoverAndHolidays.test.ts
│   └── addDecisionMaking.test.ts
└── pdf/            # PDF document generation tests
    ├── createPdf.test.ts
    ├── addAboutTheProposal.test.ts
    ├── addLivingAndVisiting.test.ts
    ├── addHandoverAndHolidays.test.ts
    └── addDecisionMaking.test.ts
```

## HTML Tests

The HTML tests verify the generation of accessible HTML documents that users can download. These tests check:
- Proper HTML structure with semantic elements
- Accessibility attributes (aria-labelledby, etc.)
- Correct content rendering based on session data
- Proper handling of various user input scenarios
- Question counter and textbox counter resets

### Running HTML Tests

```bash
npm test -- server/__tests__/html
```

## PDF Tests

The PDF tests verify the generation of PDF documents. These tests use snapshot testing to ensure PDF output remains consistent. Tests check:
- PDF generation for various data scenarios
- Handling of long text strings
- Different family arrangements
- Various decision-making options

### Running PDF Tests

```bash
npm test -- server/__tests__/pdf
```

### Updating PDF Snapshots

If you intentionally change the PDF generation logic, update the snapshots:

```bash
UPDATE_PDF_SNAPSHOTS=1 npm test -- server/__tests__/pdf
```

## Test Utilities

Shared test utilities are located in `server/test-utils/`:

- **htmlUtils.ts** - HTML validation and snapshot utilities
  - `normaliseHtml()` - Normalises HTML for consistent comparison
  - `validateHtmlAgainstSnapshot()` - HTML snapshot testing
  - `validateHtmlStructure()` - Basic HTML structure validation
  - `expectHtmlToContain()` - Helper for content assertions
  - `expectHtmlNotToContain()` - Helper for negative assertions

- **pdfUtils.ts** - PDF validation and snapshot utilities
  - `stripPdfMetadata()` - Removes dynamic metadata for comparison
  - `validateResponseAgainstSnapshot()` - PDF snapshot testing

- **testMocks.ts** - Mock objects for testing
- **testAppSetup.ts** - Express app setup for integration tests
- **testPdfAppSetup.ts** - Specialized setup for PDF tests

## Running All Tests

To run all tests in the `__tests__` directory:

```bash
npm test -- server/__tests__
```

## Best Practices

1. **Test Organization**: Keep HTML and PDF tests separate in their respective directories
2. **Test Data**: Use realistic test data that covers edge cases
3. **Naming**: Follow the pattern `add*.test.ts` for module tests and `create*.test.ts` for integration tests
4. **Assertions**: Use the utility functions from htmlUtils and pdfUtils for consistent validation
5. **Mocking**: Use the shared mocks from testMocks.ts when possible

## Adding New Tests

When adding new HTML or PDF generation modules:

1. Create a corresponding test file in the appropriate directory
2. Import the necessary test utilities
3. Follow the existing test patterns for consistency
4. Test various data scenarios including edge cases
5. Run tests locally before committing

Example test structure:

```typescript
import { Request } from 'express';
import yourModule from '../../html/yourModule';
import { sessionMock } from '../../test-utils/testMocks';
import { validateHtmlStructure, expectHtmlToContain } from '../../test-utils/htmlUtils';

describe('yourModule', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockRequest = {
      session: sessionMock,
      __: jest.fn((key: string) => key),
    } as Partial<Request>;
  });

  test('generates valid HTML', () => {
    Object.assign(sessionMock, { /* test data */ });
    const html = yourModule(mockRequest as Request);
    validateHtmlStructure(html);
    expectHtmlToContain(html, 'expected content');
  });
});
```
