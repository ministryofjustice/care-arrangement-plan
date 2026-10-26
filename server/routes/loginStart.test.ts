import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashMockErrors } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.LOGIN_START, () => {
  describe('GET', () => {
    it('should render the login start page', async () => {
      const response = await request(app).get(paths.LOGIN_START).expect(200).expect('Content-Type', /html/);

      const { document } = new JSDOM(response.text).window;

      expect(document.querySelector('h1.govuk-heading-l')).toHaveTextContent(
        'Start or continue making a child arrangements plan',
      );
      expect(document.body).toHaveTextContent('You can create and download a child arrangements plan without signing in.');
      expect(document.querySelector('main h2.govuk-heading-m')).toHaveTextContent('What would you like to do?');
      expect(document.querySelector(`label[for="${formFields.LOGIN_START}"]`)).toHaveTextContent(
        'Start a new plan without signing in',
      );
      expect(document.querySelector(`label[for="${formFields.LOGIN_START}-2"]`)).toHaveTextContent(
        'Sign in with GOV.UK One Login to continue an existing plan',
      );
      expect(document.querySelector(`form[action="${paths.LOGIN_START}"] button`)).toHaveTextContent('Continue');
      expect(document.querySelector('h2.govuk-error-summary__title')).toBeNull();
    });

    it('should include a back link to the login start page', async () => {
      const response = await request(app).get(paths.LOGIN_START).expect(200);

      const backLink = new JSDOM(response.text).window.document.querySelector('a.govuk-back-link');

      expect(backLink).not.toBeNull();
      expect(backLink).toHaveAttribute('href', paths.LOGIN_START);
      expect(backLink).toHaveTextContent('Back');
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select whether you want to start a new plan or sign in',
          path: formFields.LOGIN_START,
          type: 'field',
        },
      ]);

      const { document } = new JSDOM((await request(app).get(paths.LOGIN_START)).text).window;

      expect(document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent('There is a problem');
      expect(document.querySelector(`#${formFields.LOGIN_START}-error`)).toHaveTextContent(
        'Select whether you want to start a new plan or sign in',
      );
    });
  });
});
