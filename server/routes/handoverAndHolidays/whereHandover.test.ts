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

describe(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER, () => {
  describe('GET', () => {
    it('should render which where handover page', async () => {
      const response = await request(app).get(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Where does handover take place?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('fieldset').getAttribute('aria-describedby')).not.toContain(
        `${formFields.WHERE_HANDOVER}-error`,
      );
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER_SOMEONE_ELSE}`)).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('should render error flash responses correctly', async () => {
      const primaryError = 'errorOne';
      const secondaryError = 'errorTwo';
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: `${formFields.WHERE_HANDOVER}-0`,
          type: 'field',
        },
        {
          location: 'body',
          msg: secondaryError,
          path: `${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0`,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.WHERE_HANDOVER}-0-error`),
      );
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER}-0-error`)).toHaveTextContent(primaryError);
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0-error`,
      );
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0-error`)).toHaveTextContent(
        secondaryError,
      );
    });

    it('should render field value flash responses correctly', async () => {
      const someoneElse = 'someone else';
      Object.assign(flashFormValues, [
        {
          [`${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0`]: someoneElse,
          [`${formFields.WHERE_HANDOVER}-0`]: ['someoneElse'],
        },
      ]);

      sessionMock.handoverAndHolidays = {
        whereHandover: {
          default: { where: ['neutral', 'school'], someoneElse: 'wrong someone else', noDecisionRequired: false },
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(1);
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER}-0-5`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0`)).toHaveValue(someoneElse);
    });

    it('should render existing values correctly', async () => {
      const someoneElse = 'someone else';

      sessionMock.handoverAndHolidays = {
        whereHandover: {
          default: { where: ['neutral', 'school'], someoneElse, noDecisionRequired: false },
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(2);
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER}-0`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER}-0-4`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0`)).toHaveValue(someoneElse);
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Select where handover takes place',
          path: `${formFields.WHERE_HANDOVER}-0`,
          type: 'field',
        },
      ]);
    });

    it('should reload page and set flash when the checkboxes is someone else, but the someone else is not described', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)
        .send({ [`${formFields.WHERE_HANDOVER}-0`]: 'someoneElse' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe who will manage handover',
          path: `${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0`,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should reload page and set flash when the checkboxes is someone else and a place', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)
        .send({ [`${formFields.WHERE_HANDOVER}-0`]: ['someoneElse', 'neutral'] })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe what other arrangement you are proposing',
          path: `${formFields.WHERE_HANDOVER}-0`,
          type: 'field',
          value: ['someoneElse', 'neutral'],
        },
      ]);
    });

    it('should redirect to will change during school holidays page when the answer is complete', async () => {
      const where = 'someoneElse';
      const someoneElse = 'someone else';
      const initialHandoverAndHolidays = {
        getBetweenHouseholds: {
          default: { noDecisionRequired: true },
        },
      };

      sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)
        .send({
          [`${formFields.WHERE_HANDOVER}-0`]: 'someoneElse',
          [`${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-0`]: someoneElse,
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);

      expect(sessionMock.handoverAndHolidays).toEqual({
        ...initialHandoverAndHolidays,
        whereHandover: {
          default: { noDecisionRequired: false, where: [where], someoneElse },
        },
      });
    });
  });
});

describe(`POST ${paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER_NOT_REQUIRED}`, () => {
  it('should redirect to will change during school holidays page when the answer is entered and set whereHandover', async () => {
    const initialHandoverAndHolidays = {
      getBetweenHouseholds: {
        default: { noDecisionRequired: true },
      },
    };

    sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

    await request(app)
      .post(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);

    expect(sessionMock.handoverAndHolidays).toEqual({
      ...initialHandoverAndHolidays,
      whereHandover: {
        default: { noDecisionRequired: true },
      },
    });
  });
});
