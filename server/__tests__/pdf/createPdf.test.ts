import path from 'path';

import request from 'supertest';

import { CAPSession } from '../../@types/session';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { sessionMock } from '../../test-utils/testMocks';

jest.mock('../../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../../assets/${fileName}`));

// Mock config to ensure USE_AUTH is false
jest.mock('../../config', () => ({
  __esModule: true,
  default: {
    buildNumber: '1_0_0',
    gitRef: 'test',
    gitBranch: 'test',
    includeWelshLanguage: true,
    production: false,
    useHttps: false,
    staticResourceCacheDuration: '1h',
    analytics: { ga4Id: undefined as string | undefined },
    cache: {
      enabled: false,
      host: undefined as string | undefined,
      password: undefined as string | undefined,
      tls_enabled: undefined as boolean | undefined
    },
    session: { secret: 'test-secret', expiryMinutes: 120 },
    passwords: ['test'],
    useAuth: false,
    feedbackUrl: 'https://test.com',
    contactEmail: 'test@test.com',
    previewEnd: new Date('2025-04-30T23:59:59'),
  },
}));

const app = testAppSetup();

// Helper function to validate PDF structure
const validatePdfResponse = (response: request.Response, minSize: number) => {
  // Check response headers
  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toBe('application/pdf');
  expect(response.headers['content-disposition']).toMatch(/^attachment; filename=.*\.pdf$/);

  // Check that we got binary data
  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.length).toBeGreaterThan(minSize);

  // Verify PDF structure - should start with %PDF and end with %%EOF
  const pdfText = response.body.toString('latin1');
  expect(pdfText.startsWith('%PDF-')).toBe(true);
  expect(pdfText).toContain('%%EOF');

  // Check for jsPDF metadata
  expect(pdfText).toContain('/Producer');
  expect(pdfText).toContain('jsPDF');
};

describe('createPdf', () => {
  beforeEach(() => {
    jest.useRealTimers();
    // Clear sessionMock before each test
    Object.keys(sessionMock).forEach((key: keyof CAPSession) => delete sessionMock[key]);
  });

  test('returns the expected pdf', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: 'livingAndVisitingArrangement',
        },
      },
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: true,
        },
        whereHandover: {
          noDecisionRequired: true,
        },
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: true,
        },
        itemsForChangeover: {
          noDecisionRequired: true,
        },
      },
      specialDays: {
        whatWillHappen: {
          noDecisionRequired: false,
          answer: 'whatWillHappenAnswer',
        },
      },
      otherThings: {
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer: 'whatOtherThingsMatterAnswer',
        },
      },
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: true,
        },
        planLongTermNotice: {
          noDecisionRequired: true,
        },
        planReview: {
          months: 1,
        },
      },
    });

    const response = await request(app).get(paths.DOWNLOAD_PDF).buffer(true);

    // Validate PDF structure and ensure it's a reasonably sized document
    validatePdfResponse(response, 100000); // Should be at least 100KB
  });

  test('returns the for a long string', async () => {
    const longString = 'test '.repeat(1000);

    Object.assign(sessionMock, {
      courtOrderInPlace: true,
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: longString,
        },
      },
      handoverAndHolidays: {
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'other',
          describeArrangement: longString,
        },
        whereHandover: {
          noDecisionRequired: false,
          where: ['someoneElse'],
          someoneElse: longString,
        },
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          willChange: true,
        },
        howChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          answer: longString,
        },
        itemsForChangeover: {
          noDecisionRequired: false,
          answer: longString,
        },
      },
      specialDays: {
        whatWillHappen: {
          noDecisionRequired: false,
          answer: longString,
        },
      },
      otherThings: {
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer: longString,
        },
      },
      decisionMaking: {
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          anotherArrangementDescription: longString,
        },
        planLongTermNotice: {
          noDecisionRequired: true,
          otherAnswer: longString,
        },
        planReview: {
          months: 1,
        },
      },
    });

    const response = await request(app).get(paths.DOWNLOAD_PDF).buffer(true);

    // Validate PDF structure and ensure it's significantly larger due to long strings
    validatePdfResponse(response, 500000); // Should be at least 500KB with all the long strings
  });
});
