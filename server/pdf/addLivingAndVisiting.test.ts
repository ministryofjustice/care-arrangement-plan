import path from 'path';

import request from 'supertest';

import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils';
import { sessionMock } from '../test-utils/testMocks';
import testAppSetup, { TEST_PATH } from '../test-utils/testPdfAppSetup';

import addLivingAndVisiting from './addLivingAndVisiting';

jest.mock('../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../assets/${fileName}`));

const app = testAppSetup(addLivingAndVisiting);

describe('addLivingAndVisiting', () => {
  test('pdf matches for other', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: 'arrangement',
        },
      },
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addLivingAndVisiting-other.pdf');
  });

  test('pdf matches for split', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: 'arrangement',
        },
      },
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addLivingAndVisiting-split.pdf');
  });

  test('pdf matches for with adult with no visits', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: false,
        },
        daytimeVisits: {
          willHappen: false,
        },
      },
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addLivingAndVisiting-adultWithNoVisits.pdf');
  });

  test('pdf matches for with adult with visits', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'withSecondary',
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            days: ['monday', 'wednesday', 'friday'],
          },
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            noDecisionRequired: true,
          },
        },
      },
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addLivingAndVisiting-adultWithVisits.pdf');
  });
});
