import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

beforeEach(() => {
  sessionMock.livingAndVisiting = {
    mostlyLive: {
      where: 'split',
    },
    overnightVisits: {
      willHappen: true,
    },
  };
});

describe(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT, () => {
  describe('GET', () => {
    it('should render which days overnight page', async () => {
      const response = await request(app)
        .get(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('On which days will overnights happen?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('fieldset').getAttribute('aria-describedby')).not.toContain(
        `${formFields.WHICH_DAYS_OVERNIGHT}-error`,
      );
      expect(
        dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT}`),
      ).not.toHaveAttribute('aria-describedby');
    });

    it('should render error flash responses correctly', async () => {
      const primaryError = 'errorOne';
      const secondaryError = 'errorTwo';
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: formFields.WHICH_DAYS_OVERNIGHT,
          type: 'field',
        },
        {
          location: 'body',
          msg: secondaryError,
          path: formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.WHICH_DAYS_OVERNIGHT}-error`),
      );
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT}-error`)).toHaveTextContent(
        primaryError,
      );
      expect(
        dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT}`),
      ).toHaveAttribute('aria-describedby', `${formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT}-error`);
      expect(
        dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT}-error`),
      ).toHaveTextContent(secondaryError);
    });

    it('should render field value flash responses correctly with other arrangement', async () => {
      const arrangement = 'arrangement';
      Object.assign(flashFormValues, [
        {
          [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: arrangement,
          [formFields.WHICH_DAYS_OVERNIGHT]: ['other'],
        },
      ]);

      sessionMock.livingAndVisiting.overnightVisits.whichDays = {
        days: ['monday'],
      };

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(1);
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT}-9`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT}`)).toHaveValue(
        arrangement,
      );
    });

    it('should render field value flash responses correctly with day arrangement', async () => {
      Object.assign(flashFormValues, [
        {
          [formFields.WHICH_DAYS_OVERNIGHT]: ['monday', 'thursday'],
        },
      ]);

      sessionMock.livingAndVisiting.overnightVisits.whichDays = {
        describeArrangement: 'arrangement',
      };

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(2);
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT}`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT}-4`)).toBeChecked();
    });

    it('should render existing values correctly for other arrangement', async () => {
      const arrangement = 'arrangement';

      sessionMock.livingAndVisiting.overnightVisits.whichDays = {
        describeArrangement: arrangement,
      };

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(1);
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT}-9`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT}`)).toHaveValue(
        arrangement,
      );
    });

    it('should render existing values correctly for day arrangement', async () => {
      sessionMock.livingAndVisiting.overnightVisits.whichDays = {
        days: ['monday', 'thursday'],
      };

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)).text);

      expect(dom.window.document.querySelectorAll(':checked')).toHaveLength(2);
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT}`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.WHICH_DAYS_OVERNIGHT}-4`)).toBeChecked();
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Select which days overnights will happen on',
          path: formFields.WHICH_DAYS_OVERNIGHT,
          type: 'field',
        },
      ]);
    });

    it('should reload page and set flash when the checkboxes is other, but arrangements are not described', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)
        .send({ [formFields.WHICH_DAYS_OVERNIGHT]: 'other' })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe when the children will stay overnight',
          path: formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should reload page and set flash when the checkboxes is other and a day', async () => {
      const options = ['other', 'monday'];
      await request(app)
        .post(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)
        .send({ [formFields.WHICH_DAYS_OVERNIGHT]: options })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe what other arrangement you are proposing',
          path: formFields.WHICH_DAYS_OVERNIGHT,
          type: 'field',
          value: options,
        },
      ]);
    });

    it('should redirect to will daytime visits happen when the answer is other', async () => {
      const arrangement = 'arrangement';

      await request(app)
        .post(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)
        .send({
          [formFields.WHICH_DAYS_OVERNIGHT]: 'other',
          [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: arrangement,
        })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN);

      expect(sessionMock.livingAndVisiting).toEqual({
        mostlyLive: {
          where: 'split',
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            describeArrangement: arrangement,
          },
        },
      });
    });

    it('should redirect to will daytime visits happen when the answer is days', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)
        .send({
          [formFields.WHICH_DAYS_OVERNIGHT]: ['monday', 'thursday'],
          [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: 'arrangement',
        })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN);

      expect(sessionMock.livingAndVisiting).toEqual({
        mostlyLive: {
          where: 'split',
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            days: ['monday', 'thursday'],
          },
        },
      });
    });
  });
});

describe(`POST ${paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT_NOT_REQUIRED}`, () => {
  it('should redirect to will daytime visits happen when the answer is entered and set whatWillHappen', async () => {
    await request(app)
      .post(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN);

    expect(sessionMock.livingAndVisiting).toEqual({
      mostlyLive: {
        where: 'split',
      },
      overnightVisits: {
        willHappen: true,
        whichDays: {
          noDecisionRequired: true,
        },
      },
    });
  });
});
