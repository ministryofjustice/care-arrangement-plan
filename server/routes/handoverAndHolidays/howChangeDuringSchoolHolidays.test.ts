import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS, () => {
  describe('GET', () => {
    it('should render how change during school holidays page', async () => {
      const response = await request(app)
        .get(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        'How will the arrangements be different in school holidays?',
      );
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(
        dom.window.document
          .querySelector(`#${formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS}`)
          .getAttribute('aria-describedby'),
      ).not.toContain(`${formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS}-error`);
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS}`)).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS}-error`),
      );
    });

    it('should render existing values correctly', async () => {
      const response = 'response';

      sessionMock.handoverAndHolidays = {
        howChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          answer: response,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS)).text);

      expect(dom.window.document.querySelector(`#${formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS}`)).toHaveValue(
        response,
      );
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should redirect to items for changeover when the answer is entered and set howChangeDuringSchoolHolidays', async () => {
      const initialHandoverAndHolidays = { whereHandover: { noDecisionRequired: true } };
      sessionMock.handoverAndHolidays = initialHandoverAndHolidays;
      const answer = 'response';

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS)
        .send({ [formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS]: answer })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

      expect(sessionMock.handoverAndHolidays).toEqual({
        ...initialHandoverAndHolidays,
        howChangeDuringSchoolHolidays: { noDecisionRequired: false, answer },
      });
    });
  });
});

describe(`POST ${paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS_NOT_REQUIRED}`, () => {
  it('should redirect to items for changeover when the answer is entered and set howChangeDuringSchoolHolidays', async () => {
    const initialHandoverAndHolidays = { whereHandover: { noDecisionRequired: true } };
    sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

    await request(app)
      .post(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

    expect(sessionMock.handoverAndHolidays).toEqual({
      ...initialHandoverAndHolidays,
      howChangeDuringSchoolHolidays: { noDecisionRequired: true },
    });
  });
});
