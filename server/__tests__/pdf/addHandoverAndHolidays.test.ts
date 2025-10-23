import path from 'path';

import request from 'supertest';

import addHandoverAndHolidays from '../../pdf/addHandoverAndHolidays';
import { validateResponseAgainstSnapshot } from '../../test-utils/pdfUtils';
import { sessionMock } from '../../test-utils/testMocks';
import testAppSetup, { TEST_PATH } from '../../test-utils/testPdfAppSetup';


jest.mock('../../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../../assets/${fileName}`));

const app = testAppSetup(addHandoverAndHolidays);

const session = {
  initialAdultName: 'Bob',
  secondaryAdultName: 'Sam',
};

describe('addHandoverAndHolidays', () => {
  test.each([
    [
      'addHandoverAndHolidays-1',
      {
        getBetweenHouseholds: { noDecisionRequired: true },
        whereHandover: { noDecisionRequired: true },
        willChangeDuringSchoolHolidays: { noDecisionRequired: true },
        itemsForChangeover: { noDecisionRequired: true },
      },
    ],
    [
      'addHandoverAndHolidays-2',
      {
        getBetweenHouseholds: { noDecisionRequired: false, how: 'initialCollects' },
        whereHandover: { noDecisionRequired: false, where: ['neutral', 'initialHome', 'school'] },
        willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: false },
        itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
      },
    ],
    [
      'addHandoverAndHolidays-3',
      {
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'other',
          describeArrangement: 'getBetweenHouseholds arrangement',
        },
        whereHandover: { noDecisionRequired: false, where: ['someoneElse'], someoneElse: 'Grandma' },
        willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
        howChangeDuringSchoolHolidays: { noDecisionRequired: false, answer: 'howChangeDuringSchoolHolidays answer' },
        itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
      },
    ],
    [
      'addHandoverAndHolidays-4',
      {
        getBetweenHouseholds: { noDecisionRequired: false, how: 'secondaryCollects' },
        whereHandover: { noDecisionRequired: false, where: ['secondaryHome'] },
        willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
        howChangeDuringSchoolHolidays: { noDecisionRequired: true },
        itemsForChangeover: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' },
      },
    ],
  ])('pdf matches for %s', async (pdfName, handoverAndHolidays) => {
    Object.assign(sessionMock, {
      ...session,
      handoverAndHolidays,
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, `test-assets/${pdfName}.pdf`);
  });
});
