import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN, () => {
  describe('GET', () => {
    it('should render what will happen on special days page', async () => {
      const response = await request(app).get(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('What will happen on special days?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(`#${formFields.SPECIAL_DAYS}`)).not.toHaveAttribute('aria-describedby');
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.SPECIAL_DAYS,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.SPECIAL_DAYS}`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.SPECIAL_DAYS}-error`,
      );
    });

    it('should render existing values correctly', async () => {
      const response = 'The kids to spend alternate Christmas with each of us.';

      sessionMock.specialDays = {
        whatWillHappen: {
          noDecisionRequired: false,
          answer: response,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN)).text);

      expect(dom.window.document.querySelector(`#${formFields.SPECIAL_DAYS}`)).toHaveValue(response);
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN)
        .expect(302)
        .expect('location', paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe what you propose will happen on special days',
          path: formFields.SPECIAL_DAYS,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should redirect to task list when the answer is entered and set whatWillHappen', async () => {
      const response = 'The kids to spend alternate Christmas with each of us.';

      await request(app)
        .post(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN)
        .send({ [formFields.SPECIAL_DAYS]: response })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.specialDays.whatWillHappen).toEqual({ noDecisionRequired: false, answer: response });
    });
  });
});

describe(`POST ${paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN_NOT_REQUIRED}`, () => {
  it('should redirect to task list when the answer is entered and set whatWillHappen', async () => {
    await request(app)
      .post(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.TASK_LIST);

    expect(sessionMock.specialDays.whatWillHappen).toEqual({ noDecisionRequired: true });
  });
});
