import path from 'path';

import request from 'supertest';

import addHealth from '../../pdf/addHealth';
import { validateResponseAgainstSnapshot } from '../../test-utils/pdfUtils';
import { sessionMock } from '../../test-utils/testMocks';
import testAppSetup, { TEST_PATH } from '../../test-utils/testPdfAppSetup';

jest.mock(
  '../../utils/getAssetPath',
  () => (fileName: string) => path.resolve(__dirname, `../../../assets/${fileName}`),
);

const app = testAppSetup(addHealth);

const session = {
  numberOfChildren: 2,
  namesOfChildren: ['James', 'Rachel'],
  initialAdultName: 'Bob',
  secondaryAdultName: 'Sam',
};

describe('addHealth', () => {
  test.each([
    [
      'addHealth-answered',
      {
        routineDecisions: { noDecisionRequired: false, options: ['otherParent'] },
        childHealthNeeds: { noDecisionRequired: false, description: 'Inhaler every morning' },
      },
    ],
    [
      'addHealth-noDecisionRequired',
      {
        routineDecisions: { noDecisionRequired: true },
        childHealthNeeds: { noDecisionRequired: true },
      },
    ],
    [
      'addHealth-anotherArrangement',
      {
        routineDecisions: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'A grandparent will decide routine appointments',
        },
        childHealthNeeds: {
          noDecisionRequired: false,
          description: 'Asthma inhaler every morning and a yearly review',
        },
      },
    ],
  ])('pdf matches for %s', async (pdfName, childHealth) => {
    Object.assign(sessionMock, {
      ...session,
      childHealth,
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, `test-assets/${pdfName}.pdf`);
  });
});
