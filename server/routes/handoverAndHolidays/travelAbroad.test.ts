import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

const option = formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_OPTION;
const description = formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_DESCRIBE_ARRANGEMENT;

describe(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD, () => {
  describe('GET', () => {
    it('should render the travel abroad page', async () => {
      const response = await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'How much notice should be given before travelling abroad with the children?',
      );
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('form')).toHaveAttribute(
        'action',
        paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD,
      );
    });

    it('should render a previously saved answer', async () => {
      sessionMock.handoverAndHolidays = {
        travelAbroad: {
          noDecisionRequired: false,
          options: ['fourWeeks'],
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)).text);

      expect(dom.window.document.querySelector(`#${option}-2`)).toBeChecked();
    });

    it('should render flashed errors', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select how much notice should be given before travelling abroad with the children',
          path: option,
          type: 'field',
        },
        {
          location: 'body',
          msg: 'Describe the arrangement you are proposing',
          path: description,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)).text);

      expect(dom.window.document.querySelector(`#${option}-error`)).toHaveTextContent(
        'Select how much notice should be given before travelling abroad with the children',
      );
      expect(dom.window.document.querySelector(`#${description}-error`)).toHaveTextContent(
        'Describe the arrangement you are proposing',
      );
    });

    it('should prefer flashed answers over the saved answer', async () => {
      sessionMock.handoverAndHolidays = {
        travelAbroad: {
          noDecisionRequired: false,
          options: ['twoWeeks'],
        },
      };
      Object.assign(flashFormValues, [
        {
          [option]: 'anotherArrangement',
          [description]: 'At least 12 weeks',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)).text);

      expect(dom.window.document.querySelector(`#${option}-5`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${description}`)).toHaveValue('At least 12 weeks');
    });
  });

  describe('POST', () => {
    it('should reload the page when no option is selected', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        expect.objectContaining({
          msg: 'Select how much notice should be given before travelling abroad with the children',
          path: option,
        }),
      ]);
      expect(sessionMock.handoverAndHolidays?.travelAbroad).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when another arrangement has no description', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .send({ [option]: 'anotherArrangement' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(flashMock).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Describe the arrangement you are proposing',
            path: description,
          }),
        ]),
      );
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the description is only whitespace', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .send({
          [option]: 'anotherArrangement',
          [description]: '   ',
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(sessionMock.handoverAndHolidays?.travelAbroad).toBeUndefined();
    });

    it.each(['twoWeeks', 'fourWeeks', 'eightWeeks'] as const)(
      'should save %s and continue to travel documents',
      async (selected) => {
        sessionMock.handoverAndHolidays = { itemsForChangeover: { noDecisionRequired: true } };

        await request(app)
          .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
          .send({ [option]: selected })
          .expect(302)
          .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);

        expect(sessionMock.handoverAndHolidays?.travelAbroad).toEqual({
          noDecisionRequired: false,
          options: [selected],
          describeArrangement: undefined,
        });
        expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD]);
      },
    );

    it('should save a trimmed description when another arrangement is selected', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .send({
          [option]: 'anotherArrangement',
          [description]: '  At least 12 weeks  ',
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);

      expect(sessionMock.handoverAndHolidays?.travelAbroad).toEqual({
        noDecisionRequired: false,
        options: ['anotherArrangement'],
        describeArrangement: 'At least 12 weeks',
      });
    });

    it('should clear a previous description when a standard option is selected', async () => {
      sessionMock.handoverAndHolidays = {
        travelAbroad: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'Old arrangement',
        },
      };

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .send({ [option]: 'twoWeeks' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);

      expect(sessionMock.handoverAndHolidays?.travelAbroad).toEqual({
        noDecisionRequired: false,
        options: ['twoWeeks'],
        describeArrangement: undefined,
      });
    });

    it('should save and return to the task list', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .send({
          [option]: 'eightWeeks',
          saveAndComeBackLater: 'true',
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays?.travelAbroad).toEqual({
        noDecisionRequired: false,
        options: ['eightWeeks'],
        describeArrangement: undefined,
      });
    });

    it('should return to check your answers when that was the previous page', async () => {
      sessionMock.previousPage = paths.CHECK_YOUR_ANSWERS;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .send({ [option]: 'fourWeeks' })
        .expect(302)
        .expect('location', paths.CHECK_YOUR_ANSWERS);
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD];

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .send({ [option]: 'twoWeeks' })
        .expect(302);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD]);
    });
  });

  describe('skip', () => {
    it('should mark the question as skipped and continue to travel documents', async () => {
      sessionMock.handoverAndHolidays = {
        travelAbroad: {
          noDecisionRequired: false,
          options: ['twoWeeks'],
          describeArrangement: 'Old arrangement',
        },
      };

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD)
        .send({ skip: 'true', [option]: 'fourWeeks' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);

      expect(sessionMock.handoverAndHolidays?.travelAbroad).toEqual({
        noDecisionRequired: true,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD]);
    });
  });
});
