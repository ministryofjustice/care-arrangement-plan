import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

const option = formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_OPTION;
const description = formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_DESCRIBE_ARRANGEMENT;

describe(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS, () => {
  describe('GET', () => {
    it('should render the travel documents page', async () => {
      const response = await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS).expect('Content-Type', /html/);
      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'Who will arrange passports, visas and other travel documents for the children?',
      );
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('form')).toHaveAttribute(
        'action',
        paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS,
      );
    });

    it('should render a previously saved answer', async () => {
      sessionMock.handoverAndHolidays = {
        travelDocuments: {
          noDecisionRequired: false,
          options: ['otherParent'],
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)).text);

      expect(dom.window.document.querySelector(`#${option}-2`)).toBeChecked();
    });

    it('should render flashed errors', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select who will arrange passports, visas and other travel documents',
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

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)).text);

      expect(dom.window.document.querySelector(`#${option}-error`)).toHaveTextContent(
        'Select who will arrange passports, visas and other travel documents',
      );
      expect(dom.window.document.querySelector(`#${description}-error`)).toHaveTextContent(
        'Describe the arrangement you are proposing',
      );
    });

    it('should prefer flashed answers over the saved answer', async () => {
      sessionMock.handoverAndHolidays = {
        travelDocuments: {
          noDecisionRequired: false,
          options: ['parent'],
        },
      };
      Object.assign(flashFormValues, [
        {
          [option]: 'anotherArrangement',
          [description]: 'A grandparent arranges the passports',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)).text);

      expect(dom.window.document.querySelector(`#${option}-6`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${description}`)).toHaveValue('A grandparent arranges the passports');
    });
  });

  describe('POST', () => {
    it('should reload the page when no option is selected', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        expect.objectContaining({
          msg: 'Select who will arrange passports, visas and other travel documents',
          path: option,
        }),
      ]);
      expect(sessionMock.handoverAndHolidays?.travelDocuments).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when another arrangement has no description', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .send({ [option]: 'anotherArrangement' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);

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
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .send({
          [option]: 'anotherArrangement',
          [description]: '   ',
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);

      expect(sessionMock.handoverAndHolidays?.travelDocuments).toBeUndefined();
    });

    it.each(['parent', 'otherParent', 'bothParents', 'parentTravelling'] as const)(
      'should save %s and continue to consent to travel',
      async (selected) => {
        sessionMock.handoverAndHolidays = { travelAbroad: { noDecisionRequired: true } };

        await request(app)
          .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
          .send({ [option]: selected })
          .expect(302)
          .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT);

        expect(sessionMock.handoverAndHolidays?.travelDocuments).toEqual({
          noDecisionRequired: false,
          options: [selected],
          describeArrangement: undefined,
        });
        expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS]);
      },
    );

    it('should save a trimmed description when another arrangement is selected', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .send({
          [option]: 'anotherArrangement',
          [description]: '  A grandparent arranges the passports  ',
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT);

      expect(sessionMock.handoverAndHolidays?.travelDocuments).toEqual({
        noDecisionRequired: false,
        options: ['anotherArrangement'],
        describeArrangement: 'A grandparent arranges the passports',
      });
    });

    it('should clear a previous description when a standard option is selected', async () => {
      sessionMock.handoverAndHolidays = {
        travelDocuments: {
          noDecisionRequired: false,
          options: ['anotherArrangement'],
          describeArrangement: 'Old arrangement',
        },
      };

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .send({ [option]: 'parent' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT);

      expect(sessionMock.handoverAndHolidays?.travelDocuments).toEqual({
        noDecisionRequired: false,
        options: ['parent'],
        describeArrangement: undefined,
      });
    });

    it('should save and return to the task list', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .send({
          [option]: 'bothParents',
          saveAndComeBackLater: 'true',
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays?.travelDocuments).toEqual({
        noDecisionRequired: false,
        options: ['bothParents'],
        describeArrangement: undefined,
      });
    });

    it('should return to check your answers when that was the previous page', async () => {
      sessionMock.previousPage = paths.CHECK_YOUR_ANSWERS;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .send({ [option]: 'parentTravelling' })
        .expect(302)
        .expect('location', paths.CHECK_YOUR_ANSWERS);
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS];

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .send({ [option]: 'parent' })
        .expect(302);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS]);
    });
  });

  describe('skip', () => {
    it('should mark the question as skipped and continue to consent to travel', async () => {
      sessionMock.handoverAndHolidays = {
        travelDocuments: {
          noDecisionRequired: false,
          options: ['parent'],
          describeArrangement: 'Old arrangement',
        },
      };

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS)
        .send({ skip: 'true', [option]: 'otherParent' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT);

      expect(sessionMock.handoverAndHolidays?.travelDocuments).toEqual({
        noDecisionRequired: true,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS]);
    });
  });
});
