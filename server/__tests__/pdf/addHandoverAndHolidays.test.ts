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
  numberOfChildren: 1,
  namesOfChildren: ['Child'],
};

describe('addHandoverAndHolidays', () => {
  test.each([
    [
      'addHandoverAndHolidays-1',
      {
        getBetweenHouseholds: { default: { noDecisionRequired: true } },
        whereHandover: { default: { noDecisionRequired: true } },
        willChangeDuringSchoolHolidays: { default: { noDecisionRequired: true } },
        itemsForChangeover: { default: { noDecisionRequired: true } },
      },
    ],
    [
      'addHandoverAndHolidays-2',
      {
        getBetweenHouseholds: { default: { noDecisionRequired: false, how: 'initialCollects' } },
        whereHandover: { default: { noDecisionRequired: false, where: ['neutral', 'initialHome', 'school'] } },
        willChangeDuringSchoolHolidays: { default: { noDecisionRequired: false, willChange: false } },
        itemsForChangeover: { default: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' } },
      },
    ],
    [
      'addHandoverAndHolidays-3',
      {
        getBetweenHouseholds: {
          default: {
            noDecisionRequired: false,
            how: 'other',
            describeArrangement: 'getBetweenHouseholds arrangement',
          },
        },
        whereHandover: { default: { noDecisionRequired: false, where: ['someoneElse'], someoneElse: 'Grandma' } },
        willChangeDuringSchoolHolidays: { default: { noDecisionRequired: false, willChange: true } },
        howChangeDuringSchoolHolidays: { default: { noDecisionRequired: false, answer: 'howChangeDuringSchoolHolidays answer' } },
        itemsForChangeover: { default: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' } },
      },
    ],
    [
      'addHandoverAndHolidays-4',
      {
        getBetweenHouseholds: { default: { noDecisionRequired: false, how: 'secondaryCollects' } },
        whereHandover: { default: { noDecisionRequired: false, where: ['secondaryHome'] } },
        willChangeDuringSchoolHolidays: { default: { noDecisionRequired: false, willChange: true } },
        howChangeDuringSchoolHolidays: { default: { noDecisionRequired: true } },
        itemsForChangeover: { default: { noDecisionRequired: false, answer: 'itemsForChangeover arrangement' } },
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
