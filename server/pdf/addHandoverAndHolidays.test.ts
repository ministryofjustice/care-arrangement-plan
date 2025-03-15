import path from 'path';

import express, { Express } from 'express';
import request from 'supertest';

import setUpi18n from '../middleware/setUpi18n';
import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils';
import { sessionMock } from '../test-utils/testMocks';

import addHandoverAndHolidays from './addHandoverAndHolidays';
import Pdf from './pdf';

jest.mock('../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../assets/${fileName}`));

const testPath = '/test';

const testAppSetup = (): Express => {
  const app = express();

  app.use(setUpi18n());
  app.use((req, _response, next) => {
    req.session = sessionMock;
    next();
  });
  app.get(testPath, (req, response) => {
    const pdf = new Pdf(false);
    addHandoverAndHolidays(pdf, req);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename=test.pdf`);
    response.send(Buffer.from(pdf.toArrayBuffer()));
  });

  return app;
};

const app = testAppSetup();

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

    const response = await request(app).get(testPath);
    validateResponseAgainstSnapshot(response.body, `../../test-assets/${pdfName}.pdf`);
  });
});
