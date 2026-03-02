import fs from 'fs';
import path from 'path';

import request from 'supertest';

import { CAPSession } from '../../@types/session';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { sessionMock } from '../../test-utils/testMocks';

jest.mock('../../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../../assets/${fileName}`));

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
      tls_enabled: undefined as boolean | undefined,
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

describe('createHtml', () => {
  beforeEach(() => {
    Object.keys(sessionMock).forEach((key: keyof CAPSession) => delete sessionMock[key]);
  });

  test('generates and saves an HTML preview', async () => {
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
        getBetweenHouseholds: { noDecisionRequired: true },
        whereHandover: { noDecisionRequired: true },
        willChangeDuringSchoolHolidays: { noDecisionRequired: true },
        itemsForChangeover: { noDecisionRequired: true },
      },
      specialDays: {
        whatWillHappen: { noDecisionRequired: false, answer: 'whatWillHappenAnswer' },
      },
      otherThings: {
        whatOtherThingsMatter: { noDecisionRequired: false, answer: 'whatOtherThingsMatterAnswer' },
      },
      decisionMaking: {
        planLastMinuteChanges: { noDecisionRequired: true },
        planLongTermNotice: { noDecisionRequired: true },
        planReview: { months: 1 },
      },
    });

    const response = await request(app).get(paths.DOWNLOAD_HTML);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);

    const outputPath = path.join(process.cwd(), 'test-assets/fullTestOutput.html');
    fs.writeFileSync(outputPath, response.text);
  });
});
