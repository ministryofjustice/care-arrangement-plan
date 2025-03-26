import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

describe(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER, () => {
  describe('GET', () => {
    it('should render what what other things matter page', async () => {
      const response = await request(app)
        .get(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER)
        .expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('What other things matter to your children?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(
        dom.window.document.querySelector(`#${formFields.WHAT_OTHER_THINGS_MATTER}`).getAttribute('aria-describedby'),
      ).not.toContain(`${formFields.WHAT_OTHER_THINGS_MATTER}-error`);
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.WHAT_OTHER_THINGS_MATTER,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector(`#${formFields.WHAT_OTHER_THINGS_MATTER}`)).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(`${formFields.WHAT_OTHER_THINGS_MATTER}-error`),
      );
    });

    it('should render existing values correctly', async () => {
      const response = 'other things matter';

      sessionMock.otherThings = {
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer: response,
        },
      };

      const dom = new JSDOM((await request(app).get(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER)).text);

      expect(dom.window.document.querySelector(`#${formFields.WHAT_OTHER_THINGS_MATTER}`)).toHaveValue(response);
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER)
        .expect(302)
        .expect('location', paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe what other things matter to your children',
          path: formFields.WHAT_OTHER_THINGS_MATTER,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should redirect to task list when the answer is entered and set whatOtherThingsMatter', async () => {
      const response = 'other things matter';

      await request(app)
        .post(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER)
        .send({ [formFields.WHAT_OTHER_THINGS_MATTER]: response })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.otherThings.whatOtherThingsMatter).toEqual({ noDecisionRequired: false, answer: response });
    });
  });
});

describe(`POST ${paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER_NOT_REQUIRED}`, () => {
  it('should redirect to task list when the answer is entered and set whatWillHappen', async () => {
    await request(app)
      .post(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.TASK_LIST);

    expect(sessionMock.otherThings.whatOtherThingsMatter).toEqual({ noDecisionRequired: true });
  });
});
