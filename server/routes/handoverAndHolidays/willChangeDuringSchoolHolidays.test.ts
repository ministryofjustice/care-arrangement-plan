import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS, () => {
  describe('GET', () => {
    it('should render the will change during school holidays page', async () => {
      const response = await request(app)
        .get(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        `Will these arrangements change during school holidays?`,
      );
      expect(dom.window.document.querySelector('h2')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('fieldset')).not.toHaveAttribute('aria-describedby');
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS)).text);

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem');
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        `${formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS}-error`,
      );
    });

    it('should render field value of yes correctly', async () => {
      sessionMock.handoverAndHolidays = {
        willChangeDuringSchoolHolidays: { willChange: true, noDecisionRequired: true },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS)).text);

      expect(dom.window.document.querySelector(`#${formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS}`)).toHaveAttribute(
        'checked',
      );
    });

    it('should render field value of no correctly', async () => {
      sessionMock.handoverAndHolidays = {
        willChangeDuringSchoolHolidays: { willChange: false, noDecisionRequired: true },
      };

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS)).text);

      expect(dom.window.document.querySelector(`#${formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS}-2`)).toHaveAttribute(
        'checked',
      );
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Choose whether the arrangements will change',
          path: formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS,
          type: 'field',
        },
      ]);
    });

    it('should redirect to items for changeover if the answer is no', async () => {
      sessionMock.handoverAndHolidays = { howChangeDuringSchoolHolidays: { noDecisionRequired: true } };

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS)
        .send({ [formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS]: 'No' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

      expect(sessionMock.handoverAndHolidays).toEqual({
        willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: false },
      });
    });

    it('should redirect to which change during holidays if the answer is yes', async () => {
      const initialHandoverAndHolidays = { howChangeDuringSchoolHolidays: { noDecisionRequired: true } };
      sessionMock.handoverAndHolidays = initialHandoverAndHolidays;

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS)
        .send({ [formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS]: 'Yes' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS);

      expect(sessionMock.handoverAndHolidays).toEqual({
        ...initialHandoverAndHolidays,
        willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
      });
    });
  });
});

describe(`POST ${paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS_NOT_REQUIRED}`, () => {
  it('should redirect to items for changeover when the answer is entered and set willChangeDuringSchoolHolidays', async () => {
    sessionMock.handoverAndHolidays = { howChangeDuringSchoolHolidays: { noDecisionRequired: true } };

    await request(app)
      .post(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

    expect(sessionMock.handoverAndHolidays).toEqual({ willChangeDuringSchoolHolidays: { noDecisionRequired: true } });
  });
});
