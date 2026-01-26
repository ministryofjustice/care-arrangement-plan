import { SessionData } from 'express-session';
import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

const session: Partial<SessionData> = {
  initialAdultName: 'Sarah',
  secondaryAdultName: 'Steph',
  numberOfChildren: 1,
  namesOfChildren: ['Child 1'],
};

beforeEach(() => {
  Object.assign(sessionMock, structuredClone(session));
});

describe(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS, () => {
  describe('GET', () => {
    it('should render the get between households page', async () => {
      const response = await request(app)
        .get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'How will the children get between households?',
      );
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('fieldset')).not.toHaveAttribute('aria-describedby');
      // govukRadios generates IDs: {name}, {name}-2, {name}-3 for subsequent items
      expect(dom.window.document.querySelector(`label[for="${formFields.GET_BETWEEN_HOUSEHOLDS}-0"]`)).toHaveTextContent(
        `${session.initialAdultName} collects the children`,
      );
      expect(
        dom.window.document.querySelector(`label[for="${formFields.GET_BETWEEN_HOUSEHOLDS}-0-2"]`),
      ).toHaveTextContent(`${session.secondaryAdultName} collects the children`);
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0`),
      ).not.toHaveAttribute('aria-describedby');
    });

    it('should render error flash responses correctly', async () => {
      const primaryError = 'errorOne';
      const secondaryError = 'errorTwo';
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: `${formFields.GET_BETWEEN_HOUSEHOLDS}-0`,
          type: 'field',
        },
        {
          location: 'body',
          msg: secondaryError,
          path: `${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0`,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        `${formFields.GET_BETWEEN_HOUSEHOLDS}-0-error`,
      );
      expect(dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS}-0-error`)).toHaveTextContent(
        primaryError,
      );
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0`),
      ).toHaveAttribute('aria-describedby', `${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0-error`);
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0-error`),
      ).toHaveTextContent(secondaryError);
    });

    it('should render field value flash responses correctly', async () => {
      const arrangement = 'arrangement';
      Object.assign(flashFormValues, [
        {
          [`${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0`]: arrangement,
          [`${formFields.GET_BETWEEN_HOUSEHOLDS}-0`]: 'other',
        },
      ]);

      sessionMock.handoverAndHolidays = {
        getBetweenHouseholds: {
          default: {
            noDecisionRequired: false,
            how: 'secondaryCollects',
            describeArrangement: 'wrong arrangement',
          },
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)).text);

      // "other" is the 3rd item, so ID is {name}-3
      expect(dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS}-0-3`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0`),
      ).toHaveValue(arrangement);
    });

    it('should render field previous values correctly', async () => {
      const arrangement = 'arrangement';

      sessionMock.handoverAndHolidays = {
        getBetweenHouseholds: {
          default: {
            noDecisionRequired: false,
            how: 'other',
            describeArrangement: arrangement,
          },
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)).text);

      // "other" is the 3rd item, so ID is {name}-3
      expect(dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS}-0-3`)).toBeChecked();
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0`),
      ).toHaveValue(arrangement);
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when the radio button is not filled', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Select who will be responsible for getting the children',
          path: `${formFields.GET_BETWEEN_HOUSEHOLDS}-0`,
          type: 'field',
        },
      ]);
    });

    it('should reload page and set flash when the radio button is other, but arrangements are not described', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
        .send({ [`${formFields.GET_BETWEEN_HOUSEHOLDS}-0`]: 'other' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe how the children will get between households',
          path: `${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0`,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should redirect to where handover page if the page is correctly filled', async () => {
      const how = 'other';
      const describeArrangement = 'arrangement';
      const initialHandoverAndHolidays = { whereHandover: { default: { noDecisionRequired: true } } };

      sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
        .send({
          [`${formFields.GET_BETWEEN_HOUSEHOLDS}-0`]: how,
          [`${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-0`]: describeArrangement,
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

      expect(sessionMock.handoverAndHolidays).toEqual({
        ...initialHandoverAndHolidays,
        getBetweenHouseholds: {
          default: { noDecisionRequired: false, how, describeArrangement },
        },
      });
    });
  });
});

describe(`POST ${paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS_NOT_REQUIRED}`, () => {
  it('should redirect to where handover page when the answer is entered and set getBetweenHouseholds', async () => {
    const initialHandoverAndHolidays = { whereHandover: { default: { noDecisionRequired: true } } };

    sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

    await request(app)
      .post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

    expect(sessionMock.handoverAndHolidays).toEqual({
      ...initialHandoverAndHolidays,
      getBetweenHouseholds: {
        default: { noDecisionRequired: true },
      },
    });
  });
});
