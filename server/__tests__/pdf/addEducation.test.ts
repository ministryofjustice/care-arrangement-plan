import path from 'path';

import request from 'supertest';

import addEducation from '../../pdf/addEducation';
import { validateResponseAgainstSnapshot } from '../../test-utils/pdfUtils';
import { sessionMock } from '../../test-utils/testMocks';
import testAppSetup, { TEST_PATH } from '../../test-utils/testPdfAppSetup';

jest.mock(
  '../../utils/getAssetPath',
  () => (fileName: string) => path.resolve(__dirname, `../../../assets/${fileName}`),
);

const app = testAppSetup(addEducation);

const session = {
  numberOfChildren: 2,
  namesOfChildren: ['James', 'Rachel'],
  initialAdultName: 'Bob',
  secondaryAdultName: 'Sam',
};

describe('addEducation', () => {
  test.each([
    [
      'addEducation-answered',
      {
        shareInformation: { noDecisionRequired: false, options: ['bothParents'] },
        routineDecisions: { noDecisionRequired: false, options: ['parent'] },
        schoolMeetings: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'A grandparent attends parents evening',
        },
      },
    ],
    [
      'addEducation-noDecisionRequired',
      {
        shareInformation: { noDecisionRequired: true },
        routineDecisions: { noDecisionRequired: true },
        schoolMeetings: { noDecisionRequired: true },
      },
    ],
    [
      'addEducation-carer',
      {
        shareInformation: { noDecisionRequired: false, options: ['parent'] },
        routineDecisions: { noDecisionRequired: false, options: ['bothParents'] },
        schoolMeetings: { noDecisionRequired: false, options: ['carer'] },
      },
    ],
  ])('pdf matches for %s', async (pdfName, education) => {
    Object.assign(sessionMock, {
      ...session,
      education,
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, `test-assets/${pdfName}.pdf`);
  });
});
