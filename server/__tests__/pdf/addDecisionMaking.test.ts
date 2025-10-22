import path from 'path';

import request from 'supertest';

import { validateResponseAgainstSnapshot } from '../../test-utils/pdfUtils';
import { sessionMock } from '../../test-utils/testMocks';
import testAppSetup, { TEST_PATH } from '../../test-utils/testPdfAppSetup';

import addDecisionMaking from '../../pdf/addDecisionMaking';

jest.mock('../../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../../assets/${fileName}`));

const app = testAppSetup(addDecisionMaking);

const session = {
  initialAdultName: 'Bob',
  secondaryAdultName: 'Sam',
};

describe('addDecisionMaking', () => {
  test.each([
    [
      'addDecisionMaking-noDecisionRequired',
      {
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
    ],
    [
      'addDecisionMaking-planLastMinuteMultipleOptions',
      {
        planLastMinuteChanges: {
          options: ['phone', 'app', 'text', 'email'],
          noDecisionRequired: false,
        },
        planLongTermNotice: {
          weeks: 3,
          noDecisionRequired: false,
        },
        planReview: {
          years: 77,
        },
      },
    ],
    [
      'addDecisionMaking-singleOptions',
      {
        planLastMinuteChanges: {
          options: ['phone'],
          noDecisionRequired: false,
        },
        planLongTermNotice: {
          weeks: 2,
          noDecisionRequired: false,
        },
        planReview: {
          years: 77,
        },
      },
    ],
    [
      'addDecisionMaking-anotherArrangement',
      {
        planLastMinuteChanges: {
          options: ['anotherArrangement'],
          anotherArrangementDescription: 'plan last minute changes description',
          noDecisionRequired: false,
        },
        planLongTermNotice: {
          otherAnswer: 'long term notice description',
          noDecisionRequired: false,
        },
        planReview: {
          months: 1,
        },
      },
    ],
  ])('pdf matches for %s', async (pdfName, decisionMaking) => {
    Object.assign(sessionMock, {
      ...session,
      decisionMaking: decisionMaking,
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, `test-assets/${pdfName}.pdf`);
  });
});
