import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

const checkbox = formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER;
const description = formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_DESCRIBE_ARRANGEMENT;

describe(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER, () => {
  describe('GET', () => {
    it('should render the items for changeover page', async () => {
      const response = await request(app)
        .get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Which items should move between households?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('fieldset').getAttribute('aria-describedby')).not.toContain(
        `${checkbox}-error`,
      );
      expect(dom.window.document.querySelector(`#${description}`)).not.toHaveAttribute('aria-describedby');
      expect(dom.window.document.querySelector('form')).toHaveAttribute(
        'action',
        paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER,
      );
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select which items should move between households',
          path: checkbox,
          type: 'field',
        },
        {
          location: 'body',
          msg: 'Describe the other items',
          path: description,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${checkbox}-error`),
      );
      expect(dom.window.document.querySelector(`#${checkbox}-error`)).toHaveTextContent(
        'Select which items should move between households',
      );
      expect(dom.window.document.querySelector(`#${description}`)).toHaveAttribute(
        'aria-describedby',
        `${description}-error`,
      );
      expect(dom.window.document.querySelector(`#${description}-error`)).toHaveTextContent('Describe the other items');
    });

    it('should render existing values correctly', async () => {
      sessionMock.handoverAndHolidays = {
        itemsForChangeover: {
          noDecisionRequired: false,
          options: ['clothesAndShoes', 'toys', 'otherItems'],
          describeArrangement: 'A favourite teddy',
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(3);
      expect(dom.window.document.querySelector(`#${checkbox}`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${checkbox}-5`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${checkbox}-7`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${description}`)).toHaveValue('A favourite teddy');
    });

    it('should prefer flashed answers over the saved answer', async () => {
      sessionMock.handoverAndHolidays = {
        itemsForChangeover: {
          noDecisionRequired: false,
          options: ['clothesAndShoes'],
          describeArrangement: 'Wrong description',
        },
      };
      Object.assign(flashFormValues, [
        {
          [checkbox]: ['schoolItems', 'otherItems'],
          [description]: 'Medication',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(2);
      expect(dom.window.document.querySelector(`#${checkbox}`)).not.toBeChecked();
      expect(dom.window.document.querySelector(`#${checkbox}-2`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${checkbox}-7`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${description}`)).toHaveValue('Medication');
    });
  });

  describe('POST', () => {
    it('should reload the page when no items are selected', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Select which items should move between households',
          path: checkbox,
          type: 'field',
        },
      ]);
      expect(flashMock).toHaveBeenCalledWith('formValues', expect.any(Object));
      expect(sessionMock.handoverAndHolidays?.itemsForChangeover).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when other items is selected without a description', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({ [checkbox]: ['otherItems'] })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe the other items',
          path: description,
          type: 'field',
          value: '',
        },
      ]);
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should reload the page when the description is only whitespace', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({
          [checkbox]: ['clothesAndShoes', 'otherItems'],
          [description]: '   ',
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

      expect(sessionMock.handoverAndHolidays?.itemsForChangeover).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should save selected items and continue to travel abroad', async () => {
      const initialHandoverAndHolidays = { whereHandover: { noDecisionRequired: true } };
      sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({ [checkbox]: ['clothesAndShoes', 'schoolItems', 'electronicDevices'] })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(sessionMock.handoverAndHolidays).toEqual({
        ...initialHandoverAndHolidays,
        itemsForChangeover: {
          noDecisionRequired: false,
          options: ['clothesAndShoes', 'schoolItems', 'electronicDevices'],
          describeArrangement: undefined,
        },
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER]);
    });

    it('should save a trimmed description when other items is selected', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({
          [checkbox]: ['toys', 'otherItems'],
          [description]: '  A favourite teddy  ',
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(sessionMock.handoverAndHolidays?.itemsForChangeover).toEqual({
        noDecisionRequired: false,
        options: ['toys', 'otherItems'],
        describeArrangement: 'A favourite teddy',
      });
    });

    it('should clear a previous description when other items is not selected', async () => {
      sessionMock.handoverAndHolidays = {
        itemsForChangeover: {
          noDecisionRequired: false,
          options: ['otherItems'],
          describeArrangement: 'Old description',
        },
      };

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({
          [checkbox]: 'toiletries',
          [description]: 'Should not be saved',
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(sessionMock.handoverAndHolidays?.itemsForChangeover).toEqual({
        noDecisionRequired: false,
        options: ['toiletries'],
        describeArrangement: undefined,
      });
    });

    it('should save and return to the task list', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({
          [checkbox]: ['sports'],
          saveAndComeBackLater: 'true',
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.handoverAndHolidays?.itemsForChangeover).toEqual({
        noDecisionRequired: false,
        options: ['sports'],
        describeArrangement: undefined,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER]);
    });

    it('should not save when save and come back later is used without a selection', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({ saveAndComeBackLater: 'true' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

      expect(sessionMock.handoverAndHolidays?.itemsForChangeover).toBeUndefined();
      expect(sessionMock.completedSteps).toBeUndefined();
    });

    it('should return to check your answers when that was the previous page', async () => {
      sessionMock.previousPage = paths.CHECK_YOUR_ANSWERS;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({ [checkbox]: ['schoolItems'] })
        .expect(302)
        .expect('location', paths.CHECK_YOUR_ANSWERS);
    });

    it('should not record the completed step twice', async () => {
      sessionMock.completedSteps = [FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER];

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({ [checkbox]: ['toys'] })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER]);
    });

    it('should keep validating when skip is not true', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({ skip: 'false' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

      expect(sessionMock.completedSteps).toBeUndefined();
    });
  });

  describe('skip', () => {
    it('should mark the question as skipped and continue to travel abroad', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({ skip: 'true' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(sessionMock.handoverAndHolidays?.itemsForChangeover).toEqual({
        noDecisionRequired: true,
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER]);
    });

    it('should replace a saved answer when the question is skipped', async () => {
      sessionMock.handoverAndHolidays = {
        whereHandover: { noDecisionRequired: true },
        itemsForChangeover: {
          noDecisionRequired: false,
          options: ['clothesAndShoes'],
          describeArrangement: 'Old description',
        },
      };
      sessionMock.completedSteps = [FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER];

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
        .send({
          skip: 'true',
          [checkbox]: ['toys'],
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

      expect(sessionMock.handoverAndHolidays).toEqual({
        whereHandover: { noDecisionRequired: true },
        itemsForChangeover: { noDecisionRequired: true },
      });
      expect(sessionMock.completedSteps).toEqual([FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER]);
    });
  });
});

describe(`POST ${paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_NOT_REQUIRED}`, () => {
  it('should redirect to travel abroad and record that no decision is required', async () => {
    const initialHandoverAndHolidays = { whereHandover: { noDecisionRequired: true } };
    sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

    await request(app)
      .post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);

    expect(sessionMock.handoverAndHolidays).toEqual({
      ...initialHandoverAndHolidays,
      itemsForChangeover: { noDecisionRequired: true },
    });
  });
});
