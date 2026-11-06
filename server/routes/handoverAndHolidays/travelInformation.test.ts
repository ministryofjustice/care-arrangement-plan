import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

const field = formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION;
const description = formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION_DESCRIBE_ARRANGEMENT;

describe(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION, () => {
  describe('GET', () => {
    it('should render the travel information page', async () => {
      const response = await request(app)
        .get(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'What other information should be shared before travelling abroad with the children?',
      );
      expect(dom.window.document.body).toHaveTextContent('Select all that apply');
      expect(dom.window.document.body).toHaveTextContent('Travel information (dates, transport details)');
      expect(dom.window.document.body).toHaveTextContent('Names of people in the travel group');
      expect(dom.window.document.body).toHaveTextContent('Accommodation address');
      expect(dom.window.document.body).toHaveTextContent('Emergency contact details');
      expect(dom.window.document.body).toHaveTextContent('Passport handover arrangements');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('form')).toHaveAttribute(
        'action',
        paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION,
      );
    });

    it('should render a previously saved answer', async () => {
      sessionMock.handoverAndHolidays = {
        travelInformation: {
          noDecisionRequired: false,
          options: ['group', 'passport'],
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)).text);

      expect(dom.window.document.querySelector(`#${field}-2`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${field}-5`)).toBeChecked();
    });

    it('should render flashed errors', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select what other information should be shared before travelling abroad with the children',
          path: field,
          type: 'field',
        },
        {
          location: 'body',
          msg: 'Describe the other information',
          path: description,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)).text);

      expect(dom.window.document.querySelector(`#${field}-error`)).toHaveTextContent(
        'Select what other information should be shared before travelling abroad with the children',
      );
      expect(dom.window.document.querySelector(`#${description}-error`)).toHaveTextContent(
        'Describe the other information',
      );
    });

    it('should prefer flashed answers over the saved answer', async () => {
      sessionMock.handoverAndHolidays = {
        travelInformation: {
          noDecisionRequired: false,
          options: ['dates'],
        },
      };
      Object.assign(flashFormValues, [
        {
          [field]: ['other'],
          [description]: 'Flight numbers',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)).text);

      expect(dom.window.document.querySelector(`#${field}`)).not.toBeChecked();
      expect(dom.window.document.querySelector(`#${field}-6`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${description}`)).toHaveValue('Flight numbers');
    });
  });

  describe('POST', () => {
    it('should reload the page when no option is selected', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        expect.objectContaining({
          msg: 'Select what other information should be shared before travelling abroad with the children',
          path: field,
        }),
      ]);
      expect(sessionMock.handoverAndHolidays?.travelInformation).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when other information has no description', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({ [field]: 'other' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Describe the other information',
            path: description,
          }),
        ]),
      );
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the description is only whitespace', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({
          [field]: 'other',
          [description]: '   ',
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION);

      expect(sessionMock.handoverAndHolidays?.travelInformation).toBeUndefined();
    });

    it('should save one selected option and return to the task list', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({ [field]: 'dates' })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays?.travelInformation).toEqual({
        noDecisionRequired: false,
        options: ['dates'],
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION]);
    });

    it('should save several options and a trimmed description', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({
          [field]: ['address', 'contact', 'other'],
          [description]: '  Flight numbers  ',
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays?.travelInformation).toEqual({
        noDecisionRequired: false,
        options: ['address', 'contact', 'other'],
        describeArrangement: 'Flight numbers',
      });
    });

    it('should clear a previous description when other is not selected', async () => {
      sessionMock.handoverAndHolidays = {
        travelInformation: {
          noDecisionRequired: false,
          options: ['other'],
          describeArrangement: 'Old information',
        },
      };

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({ [field]: ['dates', 'passport'] })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays?.travelInformation).toEqual({
        noDecisionRequired: false,
        options: ['dates', 'passport'],
        describeArrangement: undefined,
      });
    });

    it('should save and return to the task list', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({
          [field]: 'group',
          saveAndComeBackLater: 'true',
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays?.travelInformation?.options).toEqual(['group']);
    });

    it('should return to check your answers when that was the previous page', async () => {
      sessionMock.previousPage = paths.CHECK_YOUR_ANSWERS;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({ [field]: 'contact' })
        .expect(302)
        .expect('location', paths.CHECK_YOUR_ANSWERS);
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION];

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({ [field]: 'address' })
        .expect(302);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION]);
    });
  });

  describe('skip', () => {
    it('should mark the question as skipped and return to the task list', async () => {
      sessionMock.handoverAndHolidays = {
        travelInformation: {
          noDecisionRequired: false,
          options: ['dates'],
          describeArrangement: 'Old information',
        },
      };

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
        .send({ skip: 'true', [field]: 'group' })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays?.travelInformation).toEqual({
        noDecisionRequired: true,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION]);
    });
  });
});
