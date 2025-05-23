import path from 'path';

import request from 'supertest';

import paths from '../constants/paths';
import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

jest.mock('../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../assets/${fileName}`));

const app = testAppSetup();

describe('createPdf', () => {
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

    const response = await request(app).get(paths.DOWNLOAD_PDF);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/fullTestOutput.pdf');
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

    const response = await request(app).get(paths.DOWNLOAD_PDF);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/fullTestOutput-longAnswers.pdf');
  });
});
